import type { AgrementDto } from "@vao/shared-bridge";

import Logger from "../../utils/logger";
import { getPool } from "../../utils/pgpool";
import { ActiviteEntity, AgrementEntity } from "./agrements.entity";
import {
  AgrementAnimationMapper,
  AgrementBilanAnnuelMapper,
  AgrementFilesMapper,
  AgrementSejoursMapper,
  AgrementsMapper,
} from "./agrements.mapper";

const log = Logger(module.filename);
// ------------------------------------------------------------
// 🏗️ Repository Shared
// ------------------------------------------------------------
export const AgrementsRepositoryShared = {
  async getAllActivites(): Promise<ActiviteEntity[]> {
    const client = await getPool().connect();
    const query = `
      SELECT id, code, libelle, activite_type
      FROM front.activite
      ORDER BY libelle ASC;
    `;
    const result = await client.query(query);

    return result.rows;
  },
  /**
   * Récupère un agrément par son ID.
   */
  async getById({
    agrementId,
    withDetails,
  }: {
    agrementId: number;
    withDetails: boolean;
  }): Promise<AgrementDto | null> {
    log.i("getById - IN");
    const query = `
        SELECT
          agr.*, pm.raison_sociale
          ${
            withDetails
              ? `,
            COALESCE(
              (
                SELECT json_agg(
                  jsonb_build_object(
                    'id', ani.id,
                    'activite_id', ani.activite_id,
                    'agrement_id', ani.agrement_id,
                    'created_at', ani.created_at,
                    'updated_at', ani.updated_at,
                    'activite', jsonb_build_object(
                      'id', act.id,
                      'code', act.code,
                      'libelle', act.libelle,
                      'activite_type', act.activite_type
                    )
                  )
                )
                FROM front.agrement_animation ani
                LEFT JOIN front.activite act ON act.id = ani.activite_id
                WHERE ani.agrement_id = agr.id
              ),
              '[]'
            ) AS agrement_animation,
            COALESCE(json_agg(DISTINCT fil.*) FILTER (WHERE fil.id IS NOT NULL), '[]') AS agrement_file,
            COALESCE(json_agg(DISTINCT sej.*) FILTER (WHERE sej.id IS NOT NULL), '[]') AS agrement_sejour,

            COALESCE(
              (
                SELECT json_agg(
                  to_jsonb(bil) || jsonb_build_object(
                    'bilan_hebergement',
                    COALESCE(
                      (
                        SELECT json_agg(bhe.*)
                        FROM front.bilan_hebergement bhe
                        WHERE bhe.agr_bilan_annuel_id = bil.id
                      ),
                      '[]'::json
                    )
                  )
                )
                FROM front.agrement_bilan_annuel bil
                WHERE bil.agrement_id = agr.id
              ),
              '[]'
            ) AS agrement_bilan_annuel
            `
              : ""
          }
        FROM front.agrements agr
          LEFT JOIN front.organismes o ON agr.organisme_id = o.id
          LEFT JOIN front.personne_morale pm ON pm.organisme_id = o.id AND pm.current = true
        ${
          withDetails
            ? `
            LEFT JOIN front.agrement_files fil ON fil.agrement_id = agr.id
            LEFT JOIN front.agrement_sejours sej ON sej.agrement_id = agr.id
            `
            : ""
        }
        WHERE agr.id = $1
        GROUP BY agr.id, pm.raison_sociale;
      `;

    const response = await getPool().query(query, [agrementId]);
    log.i("getById - DONE");
    if (!response.rows?.length) return null;
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
