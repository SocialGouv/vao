import type { AgrementMessage } from "@vao/shared-bridge";
import {
  ActiviteDto,
  addYears,
  AGREMENT_HISTORY_TYPE,
  AGREMENT_STATUT,
  AGREMENT_SVA_TIMER_STATUT,
  AGREMENT_TYPE_DEPOT,
  AgrementFilesDto,
  FUNCTIONAL_ERRORS,
  FunctionalException,
  OrganismeDto,
  PaginationQueryDto,
} from "@vao/shared-bridge";
import { PoolClient } from "pg";

import Region from "../../services/geo/Region";
import { mailService } from "../../services/mail";
import { getOne as serviceOrganismeGetOne } from "../../services/Organisme";
import TerritoireService from "../../services/Territoire";
import { AgrementsRepositoryShared } from "../../shared/agrements/agrements.repository";
import { AgrementServiceShared } from "../../shared/agrements/agrements.service";
import { AgrementMailUsagers } from "../../usagers/agrements/agrements.mail";
import AppError from "../../utils/error";
import { logger } from "../../utils/logger";
import { withTransaction } from "../../utils/pgpool";
import { AgrementMailAdmin } from "./agrements.mail";
import { AgrementsRepository } from "./agrements.repository";

const log = logger(module.filename);

export const AgrementService = {
  async getAllActivites(): Promise<ActiviteDto[]> {
    return await AgrementServiceShared.getAllActivites();
  },
  async getById({
    agrementId,
    withDetails,
  }: {
    agrementId: number;
    withDetails: boolean;
  }) {
    return await AgrementServiceShared.getById({ agrementId, withDetails });
  },
  async getHistory(agrementId: number) {
    const history = await AgrementsRepository.getHistory(agrementId);
    return history;
  },
  async getListAgrements({
    regionCode,
    queryParams,
  }: {
    regionCode: string;
    queryParams: PaginationQueryDto & {
      name?: string;
      numero?: string;
      siret?: string;
      statut?: string;
    };
  }) {
    log.i("IN");
    const criterias = [
      {
        query: (index: number, value: string) => {
          return {
            query: `
            (
              (pm.siret ILIKE '%' || $${index} || '%')
                OR
              (pp.siret ILIKE '%' || $${index} || '%')
            )
          `,
            queryParams: [value],
          };
        },
        queryKey: "siret",
        sortEnabled: true,
        sortQuery: "COALESCE(pm.siret, pp.siret)",
        sortType: "custom",
        type: "custom",
      },
      {
        key: "agr.statut",
        queryKey: "statut",
        sortEnabled: true,
        type: "default",
      },
      {
        key: "date_depot",
        queryKey: "dateDepot",
        sortEnabled: true,
        sortType: "date",
      },
      {
        key: "agr.numero",
        queryKey: "numero",
        sortEnabled: true,
        type: "default",
      },
      {
        query: (index: number, value: string) => {
          return {
            query: `(
                pm.raison_sociale ILIKE '%' || $${index} || '%'
                OR unaccent(pp.prenom) ILIKE '%' || unaccent($${index}) || '%'
                OR unaccent(pp.nom_usage) ILIKE '%' || unaccent($${index}) || '%'
                )`,
            queryParams: [value],
          };
        },
        queryKey: "name",
        sortEnabled: true,
        sortQuery: "coalesce(pm.raison_sociale, pp.nom_usage)",
        sortType: "custom",
        type: "custom",
      },
    ];
    const { count, result: agrements } =
      await AgrementsRepository.getByRegionObtention({
        criterias,
        queryParams,
        regionCode,
      });
    if (!agrements || agrements.length === 0) {
      return { count: 0, result: [] };
    }
    let agrementsWithOrganisme = await Promise.all(
      agrements.map(async (agrement) => {
        const organisme: OrganismeDto = await serviceOrganismeGetOne({
          "o.id": agrement.organismeId,
        });
        return {
          ...agrement,
          organisme,
        };
      }),
    );
    agrementsWithOrganisme = agrementsWithOrganisme.filter(
      (agrement) => agrement.organisme,
    );
    log.i("DONE");
    return { count, result: agrementsWithOrganisme };
  },
  async getMessages(
    agrementId: number,
  ): Promise<{ messages: AgrementMessage[]; unreadCount: number }> {
    const agrement = await AgrementsRepository.getById({
      agrementId,
      withDetails: false,
    });
    if (!agrement) {
      log.w("Agrement non trouvé", agrementId);
      throw new AppError("Agrement non trouvé", { statusCode: 404 });
    }
    return AgrementsRepository.getMessages(agrementId);
  },
  async markMessagesAsRead(agrementId: number): Promise<number> {
    const agrement = await AgrementsRepository.getById({
      agrementId,
      withDetails: false,
    });
    if (!agrement) {
      log.w("Agrement non trouvé", agrementId);
      throw new AppError("Agrement non trouvé", { statusCode: 404 });
    }

    return AgrementsRepository.markMessagesAsRead(agrementId);
  },
  async postMessage({
    agrementId,
    backUserId,
    message,
  }: {
    agrementId: number;
    backUserId: number;
    message: string;
  }): Promise<void> {
    const agrement = await AgrementsRepository.getById({
      agrementId,
      withDetails: false,
    });
    if (!agrement) {
      log.w("Agrement non trouvé", agrementId);
      throw new AppError("Agrement non trouvé", { statusCode: 404 });
    }

    const inserted = await AgrementsRepository.insertMessage({
      agrementId,
      backUserId,
      message,
    });

    if (!inserted) {
      log.w("Échec de l'insertion du message", { agrementId, backUserId });
      throw new AppError("Échec de l'insertion du message", {
        statusCode: 500,
      });
    }
  },
  async trackEvent(event: {
    source: string;
    agrementId: number;
    boUserId: number;
    type?: AGREMENT_HISTORY_TYPE | null;
    typePrecision?: string | null;
    metadata?: Record<string, unknown> | null;
  }) {
    return AgrementsRepository.insertHistoryEvent(event);
  },
  async updateStatut({
    agrementId,
    statut,
    boUserId,
    file,
    commentaire,
    numeroAgrement,
    territoireCode,
  }: {
    agrementId: number;
    statut: AGREMENT_STATUT;
    boUserId: string;
    file?: AgrementFilesDto;
    commentaire?: string;
    numeroAgrement?: string;
    territoireCode: string;
  }): Promise<boolean> {
    const agrement = await AgrementsRepository.getById({
      agrementId,
      withDetails: false,
    });
    if (!agrement) {
      log.w("Agrement non trouvé", agrementId);
      throw new FunctionalException(FUNCTIONAL_ERRORS.AGREMENT_NOT_FOUND);
    }

    if (
      [
        AGREMENT_STATUT.A_COMPLETER,
        AGREMENT_STATUT.A_CORRIGER,
        AGREMENT_STATUT.VALIDE,
      ].includes(statut) &&
      !commentaire &&
      !numeroAgrement
    ) {
      throw new FunctionalException(FUNCTIONAL_ERRORS.AGREMENT_INCONSISTENT);
    }

    await withTransaction(async (tx: PoolClient) => {
      agrement.commentaireRefus =
        statut === AGREMENT_STATUT.REFUSE
          ? commentaire
          : agrement.commentaireRefus;
      agrement.commentaireCorrection =
        statut === AGREMENT_STATUT.A_CORRIGER
          ? commentaire
          : agrement.commentaireCorrection;
      agrement.commentaireCompletude =
        statut === AGREMENT_STATUT.A_COMPLETER
          ? commentaire
          : agrement.commentaireCompletude;
      agrement.dateConfirmCompletude =
        statut === AGREMENT_STATUT.EN_INSTRUCTION
          ? new Date()
          : agrement.dateConfirmCompletude;
      agrement.dateVerifCompleture =
        statut === AGREMENT_STATUT.PRIS_EN_CHARGE
          ? new Date()
          : agrement.dateVerifCompleture;
      if (statut === AGREMENT_STATUT.VALIDE) {
        agrement.dateObtention = new Date();
        agrement.dateFinValidite = addYears(new Date(), 5);
        agrement.numero = numeroAgrement!;

        // On change le statut de l'agrément en validé, on considère que l'agrément est désormais actif,
        // On désactive les autres agréments actifs de l'organisme pour n'avoir qu'un seul agrément actif par organisme
        const { result: agrements } =
          await AgrementsRepository.getByOrganismeId({
            organismeId: agrement.organismeId!,
          });
        const activeAgrements = agrements.filter(
          (a) => a.statut === AGREMENT_STATUT.VALIDE,
        );
        if (activeAgrements.length === 1) {
          await AgrementsRepository.desactiverAgrement({
            agrementId: activeAgrements[0].id!,
            tx,
          });

          await AgrementService.trackEvent({
            agrementId: activeAgrements[0].id!,
            boUserId: Number(boUserId),
            source: "DREETS",
            type: AGREMENT_HISTORY_TYPE.MODIFICATION,
            typePrecision: "Désactivation de l'agrément",
          });
        }
      }

      const updated = await AgrementsRepository.updateStatut({
        agrementId,
        commentaireCompletude: agrement.commentaireCompletude!,
        commentaireCorrection: agrement.commentaireCorrection!,
        commentaireRefus: agrement.commentaireRefus!,
        dateConfirmCompletude: agrement.dateConfirmCompletude!,
        dateFinValidite: agrement.dateFinValidite!,
        dateObtention: agrement.dateObtention!,
        dateVerifCompletude: agrement.dateVerifCompleture!,
        file,
        numeroAgrement: agrement.numero!,
        statut,
        tx,
      });

      if (!updated) {
        throw new AppError("Échec de la mise à jour du statut", {
          statusCode: 500,
        });
      }

      await AgrementService.upsertSvaTimer({
        agrementId,
        statut,
        tx,
      });
    });

    let eventType: AGREMENT_HISTORY_TYPE;
    if (statut === AGREMENT_STATUT.PRIS_EN_CHARGE) {
      eventType = AGREMENT_HISTORY_TYPE.PRISE_EN_CHARGE;
    } else {
      eventType = AGREMENT_HISTORY_TYPE.STATUT_CHANGE;
    }

    await AgrementService.trackEvent({
      agrementId,
      boUserId: Number(boUserId),
      source: "DREETS",
      type: eventType,
      typePrecision: statut,
    });

    if (commentaire) {
      await AgrementService.trackEvent({
        agrementId,
        boUserId: Number(boUserId),
        metadata: { commentaire },
        source: "DREETS",
        type: AGREMENT_HISTORY_TYPE.VERIFICATION,
        typePrecision: statut,
      });
    }

    const allowedStatutsMailDreets = [
      AGREMENT_STATUT.A_COMPLETER,
      AGREMENT_STATUT.EN_INSTRUCTION,
      AGREMENT_STATUT.A_CORRIGER,
      AGREMENT_STATUT.REFUSE,
      AGREMENT_STATUT.VALIDE,
      AGREMENT_STATUT.PRIS_EN_CHARGE,
    ];
    if (allowedStatutsMailDreets.includes(statut)) {
      const organisme = await serviceOrganismeGetOne({
        "o.id": agrement.organismeId,
      });

      const typeDepot = organisme.agrement?.numero
        ? AGREMENT_TYPE_DEPOT.RENOUVELLEMENT
        : AGREMENT_TYPE_DEPOT.PREMIER;

      const regionDreets = await Region.fetchOne(territoireCode);
      if (!regionDreets) {
        throw new AppError("Échec, une région devrait exister", {
          statusCode: 500,
        });
      }
      if (
        statut === AGREMENT_STATUT.EN_INSTRUCTION ||
        statut === AGREMENT_STATUT.A_CORRIGER ||
        statut === AGREMENT_STATUT.VALIDE
      ) {
        const territoire =
          await TerritoireService.readFicheIdByTerCode(territoireCode);
        if (territoire) {
          const fiche = await TerritoireService.readOne(territoire.id);
          if (fiche?.service_mail) {
            try {
              let mailToSend = null;
              switch (statut) {
                case AGREMENT_STATUT.EN_INSTRUCTION:
                  mailToSend = AgrementMailAdmin.sendCompletudeConfirmedMail({
                    Organisme: organisme,
                    agrementId,
                    mailDreets: fiche.service_mail,
                  });
                  break;
                case AGREMENT_STATUT.A_CORRIGER:
                  mailToSend = AgrementMailAdmin.sendStatutACorrigerMail({
                    Organisme: organisme,
                    agrementId,
                    commentaire,
                    mailDreets: fiche.service_mail,
                  });
                  break;
                case AGREMENT_STATUT.VALIDE:
                  mailToSend = AgrementMailAdmin.sendStatutValideMail({
                    Organisme: organisme,
                    agrementId,
                    mailDreets: fiche.service_mail,
                    numeroAgrement: agrement.numero!,
                  });
                  break;
                default:
                  throw new Error(
                    `Statut non géré pour l'envoie de mail à la Dreets : ${statut}`,
                  );
              }
              await mailService.send(mailToSend);
            } catch (e) {
              log.w("Erreur lors de l'envoi de l'email à la Dreets", e);
            }
          } else {
            log.w("Aucun email trouvé pour le territoire", territoire.id);
          }
        }
      }
      const allowedStatutsMailOva = [
        AGREMENT_STATUT.A_COMPLETER,
        AGREMENT_STATUT.EN_INSTRUCTION,
        AGREMENT_STATUT.PRIS_EN_CHARGE,
        AGREMENT_STATUT.A_CORRIGER,
        AGREMENT_STATUT.REFUSE,
        AGREMENT_STATUT.VALIDE,
      ];

      if (!allowedStatutsMailOva.includes(statut)) {
        return true;
      }
      const resultat = await AgrementsRepository.getUserMail(agrementId);
      const mailsOVA = resultat.map((u: { mail: string }) => u.mail);
      if (mailsOVA.length > 0) {
        try {
          let mailToSend;

          switch (statut) {
            case AGREMENT_STATUT.A_COMPLETER:
              mailToSend = AgrementMailUsagers.sendStatutACompleterMail({
                commentaire,
                date: agrement.dateDepot,
                email: mailsOVA,
                regionDreets: regionDreets.text,
                typeDepot,
              });
              break;
            case AGREMENT_STATUT.EN_INSTRUCTION:
              mailToSend = AgrementMailUsagers.sendCompletudeConfirmedMail({
                date: agrement.dateConfirmCompletude,
                email: mailsOVA,
                regionDreets: regionDreets.text,
              });
              break;
            case AGREMENT_STATUT.PRIS_EN_CHARGE:
              mailToSend = AgrementMailUsagers.sendPrisEnChargeMail({
                date: agrement.dateVerifCompleture,
                email: mailsOVA,
                regionDreets: regionDreets.text,
                typeDepot,
              });
              break;
            case AGREMENT_STATUT.A_CORRIGER:
              mailToSend = AgrementMailUsagers.sendStatutACorrigerMail({
                email: mailsOVA,
                regionDreets: regionDreets.text,
              });
              break;
            case AGREMENT_STATUT.REFUSE:
              mailToSend = AgrementMailUsagers.sendStatutRefuseMail({
                email: mailsOVA,
                regionDreets: regionDreets.text,
              });
              break;
            case AGREMENT_STATUT.VALIDE:
              mailToSend = AgrementMailUsagers.sendStatutValideMail({
                dateFinValidite: agrement.dateFinValidite!,
                dateObtention: agrement.dateObtention!,
                email: mailsOVA,
                numeroAgrement: agrement.numero!,
                regionDreets: regionDreets.text,
              });
              break;
            default:
              throw new Error(
                `Statut non géré pour l'envoie de mail : ${statut}`,
              );
          }

          await mailService.send(mailToSend);
        } catch (e) {
          log.w(
            `Erreur lors de l'envoi de l'email pour le changement de statut : ${statut}`,
            e,
          );
        }
      } else {
        log.w("Aucun email trouvé pour l'agrément", agrementId);
      }
    }
    return true;
  },
  async upsertSvaTimer({
    tx,
    agrementId,
    statut,
  }: {
    agrementId: number;
    statut: AGREMENT_STATUT;
    tx: PoolClient;
  }): Promise<void> {
    const agrementPrecedent = await AgrementsRepository.getById({
      agrementId,
      withDetails: false,
    });
    // Complétude confirmée : On déclenche le début du délai du SVA
    if (statut === AGREMENT_STATUT.EN_INSTRUCTION) {
      const timerId = await AgrementsRepository.insertSvaTimer({
        agrementId,
        tx,
      });
      // Début du chrono de la première période du SVA
      await AgrementsRepositoryShared.insertSvaPeriode({
        timerId,
        tx,
      });
      return;
    }
    if (
      agrementPrecedent?.statut === AGREMENT_STATUT.EN_INSTRUCTION &&
      (statut === AGREMENT_STATUT.VALIDE || statut === AGREMENT_STATUT.REFUSE)
    ) {
      const timerId = await AgrementsRepositoryShared.updateSvaTimer({
        agrementId,
        statut: AGREMENT_SVA_TIMER_STATUT.STOPPED,
        tx,
      });
      if (!timerId) {
        throw new AppError("SVA Timer non trouvé pour l'agrément", {
          statusCode: 500,
        });
      }
      // Début du chrono de la première période du SVA
      await AgrementsRepositoryShared.updateSvaPeriode({
        timerId,
        tx,
      });
      return;
    }

    // Suspension du délai du SVA en cas de demande de correction pour permettre à l'OVA
    // de faire les corrections demandées sans subir les conséquences du dépassement du délai du SVA
    if (statut === AGREMENT_STATUT.A_CORRIGER) {
      // Suspension du SVA : mise à jour du statut du timer en PAUSED
      const timerId = await AgrementsRepositoryShared.updateSvaTimer({
        agrementId,
        statut: AGREMENT_SVA_TIMER_STATUT.PAUSED,
        tx,
      });
      if (!timerId) {
        throw new AppError("SVA Timer non trouvé pour l'agrément", {
          statusCode: 500,
        });
      }
      // Mise à jour de la période pour suspendre au jour de la demande de modification
      const updated = await AgrementsRepositoryShared.updateSvaPeriode({
        timerId,
        tx,
      });
      if (!updated) {
        throw new AppError("Échec de la mise à jour de la période SVA", {
          statusCode: 500,
        });
      }
    }
  },
};
