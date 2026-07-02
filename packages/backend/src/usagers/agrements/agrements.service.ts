import type {
  ActiviteDto,
  AgrementDto,
  AgrementMessage,
  OrganismeDto,
} from "@vao/shared-bridge";
import {
  addYears,
  AGREMENT_HISTORY_TYPE,
  AGREMENT_STATUT,
  AGREMENT_SVA_TIMER_STATUT,
  FILE_CATEGORY,
  ORGANISME_TYPE,
} from "@vao/shared-bridge";
import { PoolClient } from "pg";

import { AgrementMailAdmin } from "../../admin/agrements/agrements.mail";
import Region from "../../services/geo/Region";
import insee from "../../services/Insee";
import { mailService } from "../../services/mail";
import Organisme from "../../services/Organisme";
import TerritoireService, {
  getFichesTerritoireForRegionByInseeCode,
} from "../../services/Territoire";
import { AgrementsRepositoryShared } from "../../shared/agrements/agrements.repository";
import { AgrementServiceShared } from "../../shared/agrements/agrements.service";
import AppError from "../../utils/error";
import { logger } from "../../utils/logger";
import { withTransaction } from "../../utils/pgpool";
import { AgrementMailUsagers } from "./agrements.mail";
import { AgrementsRepository } from "./agrements.repository";

const log = logger(module.filename);

// Statuts pour lesquels l'OVA soumet ou modifie un dossier.
// PRIS_EN_CHARGE et REFUSE sont pas inclus pcq ce sont des statuts DREETS,
// l'OVA ne soumet aucune modification à ces étapes.
const STATUTS_NECESSITANT_PROCES_VERBAL = new Set([
  AGREMENT_STATUT.TRANSMIS,
  AGREMENT_STATUT.A_COMPLETER,
  AGREMENT_STATUT.EN_INSTRUCTION,
  AGREMENT_STATUT.A_CORRIGER,
]);

async function getEmailRegion(codeRegion: string): Promise<string | null> {
  const fiche = await TerritoireService.readFicheIdByTerCode(codeRegion);
  if (!fiche?.id) return null;
  const ficheTerritoire = await TerritoireService.readOne(fiche.id);
  return ficheTerritoire?.service_mail || null;
}

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
  async getList({
    userId,
    statut,
  }: {
    userId: number;
    statut?: string | null;
  }): Promise<AgrementDto[] | []> {
    const agrements = await AgrementsRepository.getList({
      statut,
      userId,
    });
    return agrements;
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
    return await AgrementsRepository.getMessages(agrementId);
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

    return await AgrementsRepository.markMessagesAsRead(agrementId);
  },
  async postMessage({
    agrementId,
    userId,
    message,
  }: {
    agrementId: number;
    userId: number;
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
      message,
      userId,
    });

    if (!inserted) {
      log.w("Échec de l'insertion du message", { agrementId, userId });
      throw new AppError("Échec de l'insertion du message", {
        statusCode: 500,
      });
    }
  },
  async save(agrement: AgrementDto, userId: string): Promise<number> {
    agrement.dateFinValidite = addYears(agrement?.dateObtention, 5);
    // Validation métier spécifique au type d'organisme.
    // Le schéma partagé ne connaît pas le type d'organisme (personne morale
    // vs personne physique), donc la vérification du procès-verbal est faite
    // ici.
    const organisme: OrganismeDto | null = await Organisme.getOne({
      "o.id": agrement.organismeId,
    });

    if (!organisme) {
      log.w("Organisme introuvable pour l'agrément", {
        organismeId: agrement.organismeId,
      });
      throw new AppError("Organisme introuvable pour l'agrément", {
        statusCode: 422,
      });
    }

    const isPersonneMorale =
      organisme.typeOrganisme === ORGANISME_TYPE.PERSONNE_MORALE;

    const isStatutNecessitantProcesVerbal =
      STATUTS_NECESSITANT_PROCES_VERBAL.has(agrement.statut!);
    const hasProcesVerbal = agrement.agrementFiles?.some(
      (file) => file.category === FILE_CATEGORY.PROCVERBAL,
    );

    if (
      isPersonneMorale &&
      isStatutNecessitantProcesVerbal &&
      !hasProcesVerbal
    ) {
      log.w(
        "Validation échouée : procès verbal manquant pour personne morale",
        { agrementId: agrement.id },
      );
      throw new AppError(
        "Le procès verbal est requis pour une personne morale",
        { statusCode: 400 },
      );
    }

    let agrementId = null;
    if (agrement && agrement?.id) {
      agrementId = agrement.id;
      const agrementAvant = await AgrementsRepository.getById({
        agrementId,
        withDetails: false,
      });

      const premiereTransmission =
        agrementAvant?.statut === AGREMENT_STATUT.BROUILLON &&
        agrement.statut === AGREMENT_STATUT.TRANSMIS;
      // Ajout de la date de dépôt lorqu'il s'agit de la première transmission
      agrement.dateDepot = premiereTransmission
        ? new Date()
        : agrement?.dateDepot;

      await withTransaction(async (tx: PoolClient) => {
        agrementId = await AgrementsRepository.update({
          agrement,
          tx,
        });
        await AgrementService.updateSvaTimer({
          agrementId,
          statut: agrement.statut!,
          tx,
        });
      });

      if (
        agrement.statut === AGREMENT_STATUT.TRANSMIS ||
        agrement.statut === AGREMENT_STATUT.EN_INSTRUCTION
      ) {
        try {
          await AgrementService.trackEvent({
            agrementId,
            source: "usager",
            type: AGREMENT_HISTORY_TYPE.TRANSMISSION,
            typePrecision: agrement.statut,
            usagerUserId: Number(userId),
          });
        } catch (e) {
          log.w(
            "Impossible de tracer l'historique. AgrementId=" + agrementId,
            e,
          );
        }

        const email = await AgrementsRepository.getUserMail(agrementId!);
        const date = new Date().toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

        let organismeName = "";
        let siret = "";
        let nomObtentionRegion = null;
        let emailRegion: string | null = null;

        try {
          if (isPersonneMorale && organisme.personneMorale) {
            organismeName = organisme.personneMorale.raisonSociale || "";
            siret = organisme.personneMorale.siret || "";
          } else if (
            organisme.typeOrganisme === ORGANISME_TYPE.PERSONNE_PHYSIQUE &&
            organisme.personnePhysique
          ) {
            organismeName =
              organisme.personnePhysique.nomUsage?.trim() ||
              organisme.personnePhysique.nomNaissance ||
              "";
            siret = organisme.personnePhysique.siret || "";
          }

          const codeObtentionRegion = agrement.regionObtention || null;
          if (codeObtentionRegion) {
            const region = await Region.fetchOne(codeObtentionRegion);
            nomObtentionRegion = region.text;
            emailRegion = await getEmailRegion(codeObtentionRegion);
          }
        } catch (e) {
          log.w(
            "Impossible d'envoyer l'email à la région : informations manquantes ou erreur lors de la récupération. AgrementId=" +
              agrementId,
            e,
          );
        }

        if (emailRegion) {
          try {
            if (agrement.statut === AGREMENT_STATUT.EN_INSTRUCTION) {
              const mailToSend =
                AgrementMailAdmin.sendStatutCorrectionRegionMail({
                  agrementId,
                  email: emailRegion,
                  organismeName,
                });
              await mailService.send(mailToSend);
            } else {
              const mailToSend = premiereTransmission
                ? // Première Transmission
                  AgrementMailAdmin.sendStatutTransmisRegionMail({
                    agrementId,
                    date,
                    email: emailRegion,
                    organismeName,
                    siret,
                  })
                : // Transmission après demande de modification
                  AgrementMailAdmin.sendStatutModificationTransmisRegionMail({
                    agrementId,
                    email: emailRegion,
                    organismeName,
                  });
              await mailService.send(mailToSend);
            }
          } catch (e) {
            log.w("Erreur lors de l'envoi de l'email à la région", e);
          }
        }

        if (!email) {
          log.w("Aucun email trouvé pour l'agrément", agrementId);
          return agrementId;
        }
        if (agrement.statut === AGREMENT_STATUT.TRANSMIS) {
          try {
            await mailService.send(
              AgrementMailUsagers.sendStatutTransmisMail({
                date,
                email,
                regionDreets: nomObtentionRegion,
              }),
            );
          } catch (e) {
            log.w("Erreur lors de l'envoi de l'email de transmission", e);
          }
        }
      }
      log.d("updated meta values - DONE", { agrementId });
    } else {
      // Pour la création d'un nouvel agrément,
      // si c'est le premier agrément, on ne connait pas la région d'obtention,
      // Il faut donc la récupérer à partir de l'insee de l'adresse de la personne morale ou physique.
      if (!agrement.regionObtention) {
        const siret =
          organisme.personneMorale?.siret ?? organisme.personnePhysique?.siret;

        try {
          const etablissement = await insee.getEtablissement(siret);
          if (!etablissement) {
            throw new AppError(
              "problème de retour de l'insee Etablissement non trouvé.",
              {
                statusCode: 400,
              },
            );
          }
          const inseeCode = String(
            etablissement.adresseEtablissement.codeCommuneEtablissement,
          );
          const codeRegionObtention =
            await getFichesTerritoireForRegionByInseeCode({
              inseeCode,
            });
          agrement.regionObtention = codeRegionObtention.terCode;
        } catch (error) {
          throw new AppError("Erreur de retour de l'insee.", {
            cause: error,
            statusCode: 400,
          });
        }
      }

      agrementId = await AgrementsRepository.create({
        agrement,
      });
      log.d("Add meta values - DONE", { agrementId });
    }

    return agrementId;
  },
  async trackEvent(event: {
    source: string;
    agrementId: number;
    usagerUserId: number;
    type?: AGREMENT_HISTORY_TYPE | null;
    typePrecision?: string | null;
    metadata?: Record<string, unknown> | null;
  }) {
    return AgrementsRepository.insertHistoryEvent(event);
  },
  async updateStatut({
    agrementId,
    statut,
    usagerUserId,
  }: {
    agrementId: number;
    statut: AGREMENT_STATUT;
    usagerUserId: string;
  }): Promise<boolean> {
    await withTransaction(async (tx: PoolClient) => {
      const updated = await AgrementsRepository.updateStatut({
        agrementId,
        statut,
        tx,
      });
      if (!updated) {
        throw new AppError("Échec de la mise à jour du statut", {
          statusCode: 500,
        });
      }
      await AgrementService.updateSvaTimer({
        agrementId,
        statut,
        tx,
      });
    });

    await AgrementService.trackEvent({
      agrementId,
      source: "usager",
      type: AGREMENT_HISTORY_TYPE.STATUT_CHANGE,
      typePrecision: statut,
      usagerUserId: Number(usagerUserId),
    });

    return true;
  },
  async updateSvaTimer({
    agrementId,
    tx,
    statut,
  }: {
    agrementId: number;
    tx: PoolClient;
    statut: AGREMENT_STATUT;
  }): Promise<void> {
    // Côté OVA, lorsque l'utilisateur fait le retour, alors on redéclenche le SVA.
    // - changement de statut du timer en RUNNING
    // - Nouvelle période
    if (statut === AGREMENT_STATUT.EN_INSTRUCTION) {
      const timerId = await AgrementsRepositoryShared.updateSvaTimer({
        agrementId,
        statut: AGREMENT_SVA_TIMER_STATUT.RUNNING,
        tx,
      });
      if (!timerId) {
        throw new AppError("SVA Timer non trouvé pour l'agrément", {
          statusCode: 500,
        });
      }
      // On redémarre une nouvelle période
      await AgrementsRepositoryShared.insertSvaPeriode({
        timerId,
        tx,
      });
    }
  },
};
