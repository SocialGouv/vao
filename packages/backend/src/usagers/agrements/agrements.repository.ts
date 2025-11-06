import { AgrementsDto } from "@vao/shared-bridge";

import Logger from "../../utils/logger";
import { getPool } from "../../utils/pgpool";
import { AgrementEntity } from "./agrements.entity";
import {
  //ActiviteMapper,
  AgrementAnimationMapper,
  AgrementBilanAnnuelMapper,
  AgrementFilesMapper,
  AgrementSejoursMapper,
  AgrementsMapper,
  //BilanHebergementMapper,
} from "./agrements.mapper";

const log = Logger(module.filename);

export const AgrementsRepository = {
  /**
   * Récupère un agrément par organisme ID (avec ou sans détails liés)
   */
  getByOrganismeId: async ({
    organismeId,
    withDetails,
  }: {
    organismeId: number;
    withDetails: boolean;
  }): Promise<AgrementsDto | null> => {
    log.i("getByOrganismeId - IN");

    const query = `
      SELECT
        agr.*
        ${
          withDetails
            ? `,
          COALESCE(json_agg(DISTINCT act.*) FILTER (WHERE act.id IS NOT NULL), '[]') AS activite,
          COALESCE(json_agg(DISTINCT ani.*) FILTER (WHERE ani.id IS NOT NULL), '[]') AS agrement_animation,
          COALESCE(json_agg(DISTINCT fil.*) FILTER (WHERE fil.id IS NOT NULL), '[]') AS agrement_file,
          COALESCE(json_agg(DISTINCT sej.*) FILTER (WHERE sej.id IS NOT NULL), '[]') AS agrement_sejour,
          COALESCE(json_agg(DISTINCT bil.*) FILTER (WHERE bil.id IS NOT NULL), '[]') AS agrement_bilan_annuel`
            : ""
        }
      FROM front.agrements agr
      ${
        withDetails
          ? `
          LEFT JOIN front.agrement_animation ani ON ani.agrement_id = agr.id
          LEFT JOIN front.activite act ON act.id = ani.activite_id
          LEFT JOIN front.agrement_files fil ON fil.agrement_id = agr.id
          LEFT JOIN front.agrement_sejours sej ON sej.agrement_id = agr.id
          LEFT JOIN front.agrement_bilan_annuel bil ON bil.agrement_id = agr.id
        `
          : ""
      }
      WHERE agr.organisme_id = $1
      GROUP BY agr.id;
    `;

    const response = await getPool().query(query, [organismeId]);
    log.i("getByOrganismeId - DONE");

    if (!response.rows?.length) {
      return null;
    }

    const row = response.rows[0] as AgrementEntity;

    const agrementDto = AgrementsMapper.toModel(row);

    if (withDetails) {
      agrementDto.agrementAnimation = row.agrement_animation
        ? AgrementAnimationMapper.toModels(row.agrement_animation)
        : [];

      agrementDto.agrementFiles = row.agrement_file
        ? AgrementFilesMapper.toModels(row.agrement_file)
        : [];

      agrementDto.agrementSejours = row.agrement_sejour
        ? AgrementSejoursMapper.toModels(row.agrement_sejour)
        : [];

      agrementDto.agrementBilanAnnuel = row.agrement_bilan_annuel
        ? AgrementBilanAnnuelMapper.toModels(row.agrement_bilan_annuel)
        : [];
    }

    return agrementDto;
  },
};
