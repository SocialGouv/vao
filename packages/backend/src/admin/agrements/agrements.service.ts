import {
  AGREMENT_HISTORY_TYPE,
  AGREMENT_STATUT,
  AgrementFilesDto,
  FUNCTIONAL_ERRORS,
  FunctionalException,
  OrganismeDto,
  PaginationQueryDto,
} from "@vao/shared-bridge";

import Region from "../../services/geo/Region";
import { mailService } from "../../services/mail";
import { getOne as serviceOrganismeGetOne } from "../../services/Organisme";
import AppError from "../../utils/error";
import logger from "../../utils/logger";
import MailUtils from "../../utils/mail";
import { AgrementsRepository } from "./agrements.repository";

const log = logger(module.filename);

export const AgrementService = {
  async getById(agrementId: number) {
    return AgrementsRepository.getById(agrementId);
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
    territoireCode,
  }: {
    agrementId: number;
    statut: AGREMENT_STATUT;
    boUserId: string;
    file?: AgrementFilesDto;
    commentaire?: string;
    territoireCode: string;
  }): Promise<boolean> {
    const agrement = await AgrementsRepository.getById(agrementId);
    if (!agrement) {
      log.w("Agrement non trouvé", agrementId);
      throw new FunctionalException(FUNCTIONAL_ERRORS.AGREMENT_NOT_FOUND);
    }

    if (
      [AGREMENT_STATUT.REFUSE, AGREMENT_STATUT.A_MODIFIER].includes(statut) &&
      !commentaire
    ) {
      throw new FunctionalException(FUNCTIONAL_ERRORS.AGREMENT_INCONSISTENT);
    }

    const updated = await AgrementsRepository.updateStatut({
      agrementId,
      commentaire,
      file,
      statut,
    });
    if (!updated) {
      throw new AppError("Échec de la mise à jour du statut", {
        statusCode: 500,
      });
    }

    let eventType: AGREMENT_HISTORY_TYPE;
    if (statut === AGREMENT_STATUT.VERIF_EN_COURS) {
      eventType = AGREMENT_HISTORY_TYPE.TRANSMISSION;
    } else if (statut === AGREMENT_STATUT.EN_COURS) {
      eventType = AGREMENT_HISTORY_TYPE.EN_COURS;
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

    if (statut === AGREMENT_STATUT.A_MODIFIER) {
      const regionDreets = await Region.fetchOne(territoireCode);
      if (!regionDreets) {
        throw new AppError("Échec, une région devrait exister", {
          statusCode: 500,
        });
      }
      const resultat = await AgrementsRepository.getUserMail(agrementId);
      const mailsOVA = resultat.map((u: { mail: string }) => u.mail);
      if (mailsOVA.length > 0) {
        try {
          await mailService.send(
            MailUtils.usagers.agrement.sendStatutAModifierMail({
              commentaire,
              email: mailsOVA,
              regionDreets: regionDreets.text,
            }),
          );
        } catch (e) {
          log.w("Erreur lors de l'envoi de l'email de transmission", e);
        }
      } else {
        log.w("Aucun email trouvé pour l'agrément", agrementId);
      }
    }

    return true;
  },
};
