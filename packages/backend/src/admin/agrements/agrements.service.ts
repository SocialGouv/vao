import type { AgrementMessage } from "@vao/shared-bridge";
import {
  AGREMENT_HISTORY_TYPE,
  AGREMENT_STATUT,
  OrganismeDto,
  PaginationQueryDto,
} from "@vao/shared-bridge";

import { getOne as serviceOrganismeGetOne } from "../../services/Organisme";
import AppError from "../../utils/error";
import logger from "../../utils/logger";
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
  async getMessages(agrementId: number): Promise<AgrementMessage[]> {
    const agrement = await AgrementsRepository.getById(agrementId);
    if (!agrement) {
      log.w("Agrement non trouvé", agrementId);
      throw new AppError("Agrement non trouvé", { statusCode: 404 });
    }

    const messages = await AgrementsRepository.getMessages(agrementId);
    return messages;
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
    const agrement = await AgrementsRepository.getById(agrementId);
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
  }: {
    agrementId: number;
    statut: AGREMENT_STATUT;
    boUserId: string;
  }): Promise<boolean> {
    const agrement = await AgrementsRepository.getById(agrementId);
    if (!agrement) {
      log.w("Agrement non trouvé", agrementId);
      throw new AppError("Agrement non trouvé", { statusCode: 404 });
    }

    const updated = await AgrementsRepository.updateStatut({
      agrementId,
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

    return true;
  },
};
