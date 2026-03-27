import type {
  AGREMENT_HISTORY_TYPE,
  AgrementFilesDto,
  AgrementHistoryItem,
  AgrementHistoryRow,
} from "@vao/shared-bridge";
import {
  AGREMENT_STATUT,
  AgrementDto,
  PaginationQueryDto,
} from "@vao/shared-bridge";

import { processQuery } from "../../helpers/queryParams";
import { AgrementEntity } from "../../shared/agrements/agrements.entity";
import { AgrementsMapper } from "../../shared/agrements/agrements.mapper";
import { AgrementsRepositoryShared } from "../../shared/agrements/agrements.repository";
import Logger from "../../utils/logger";
import { getPool } from "../../utils/pgpool";

const log = Logger(module.filename);
// ------------------------------------------------------------
// 🏗️ Repository Admin
// ------------------------------------------------------------
export const AgrementsRepository = {
  async getById({
    agrementId,
    withDetails,
  }: {
    agrementId: number;
    withDetails: boolean;
  }): Promise<AgrementDto | null> {
    return AgrementsRepositoryShared.getById({ agrementId, withDetails });
  },
  /**
   * Récupère une liste d'agréments par région d'obtention
   */
  async getByRegionObtention({
    regionCode,
    criterias,
    queryParams,
  }: {
    regionCode: string;
    criterias: Array<Record<string, any>>;
    queryParams: PaginationQueryDto & {
      name?: string;
      numero?: string;
      siret?: string;
      statut?: string;
    };
  }): Promise<{ count: number; result: AgrementDto[] }> {
    log.i("getByRegionObtention - IN");
    const query = () => `
      SELECT
        agr.*,
        pm.siret,
        pm.raison_sociale,
        pp.prenom,
        pp.nom_usage,
        pp.siret
      FROM front.agrements agr
      INNER JOIN front.organismes o ON o.id = agr.organisme_id
      LEFT JOIN front.personne_morale pm ON pm.organisme_id = o.id AND pm.current = true
      LEFT JOIN front.personne_physique pp ON pp.organisme_id = o.id AND pp.current = true
      WHERE agr.region_obtention = $1
    `;

    const paginatedQuery = processQuery(
      query,
      [regionCode],
      criterias ?? {},
      queryParams,
    );
    const response = await Promise.all([
      getPool().query(paginatedQuery.query, paginatedQuery.params),
      getPool().query(
        paginatedQuery.countQuery,
        paginatedQuery.countQueryParams,
      ),
    ]);
    const agrements = [];
    for (const row of response[0].rows) {
      const agrement = AgrementsMapper.toModel(row as AgrementEntity);
      agrements.push(agrement);
    }
    log.i("getByRegionObtention - DONE");

    return {
      count: parseInt(response[1].rows[0].total, 10),
      result: agrements,
    };
  },

  async getHistory(agrementId: number): Promise<AgrementHistoryItem[]> {
    const client = await getPool().connect();
    try {
      const query = `
      SELECT
        h.id,
        h.source,
        h.agrement_id,
        h.usager_user_id,
        u.nom AS usager_nom,
        u.prenom AS usager_prenom,
        u.mail AS usager_mail,
        h.bo_user_id,
        b.nom AS bo_nom,
        b.prenom AS bo_prenom,
        b.mail AS bo_mail,
        h.type,
        h.type_precision,
        h.metadata,
        h.created_at
      FROM front.agrement_history h
      LEFT JOIN front.users u ON h.usager_user_id = u.id
      LEFT JOIN back.users b ON h.bo_user_id = b.id
      WHERE h.agrement_id = $1
      ORDER BY h.created_at DESC;
    `;
      const result = await client.query(query, [agrementId]);
      return result.rows.map((row: AgrementHistoryRow) => ({
        agrement_id: row.agrement_id,
        bo_user: row.bo_user_id
          ? {
              id: row.bo_user_id,
              mail: row.bo_mail,
              nom: row.bo_nom,
              prenom: row.bo_prenom,
            }
          : null,
        created_at: row.created_at,
        id: row.id,
        metadata: row.metadata,
        source: row.source,
        type: row.type,
        type_precision: row.type_precision,
        usager_user: row.usager_user_id
          ? {
              id: row.usager_user_id,
              mail: row.usager_mail,
              nom: row.usager_nom,
              prenom: row.usager_prenom,
            }
          : null,
      }));
    } finally {
      client.release();
    }
  },
  /**
   * Récupère le courriel du user responsable d'un agrément.
   */
  async getUserMail(agrementId: number): Promise<{ mail: string }[]> {
    const client = await getPool().connect();
    try {
      const result = await client.query(
        `SELECT u.mail
          FROM front.agrements a
          JOIN front.organismes o ON a.organisme_id = o.id
          JOIN front.user_organisme uo ON uo.org_id = o.id
          JOIN front.users u ON uo.use_id = u.id
          WHERE a.id = $1
          GROUP BY u.mail`,
        [agrementId],
      );
      if (result.rows.length === 0) {
        return [];
      }
      return result.rows;
    } finally {
      client.release();
    }
  },

  async insertAgrementFiles(
    client: any,
    agrementId: number | null | undefined,
    file: AgrementFilesDto,
  ) {
    if (!file) return;
    await client.query(
      `INSERT INTO front.agrement_files (agrement_id, category, file_uuid)
       VALUES ($1, $2, $3);`,
      [agrementId, file.category, file.fileUuid],
    );
  },

  async insertHistoryEvent({
    source,
    agrementId,
    boUserId,
    type,
    typePrecision,
    metadata,
  }: {
    source: string;
    agrementId: number;
    boUserId: number | null;
    type?: AGREMENT_HISTORY_TYPE | null;
    typePrecision?: string | null;
    metadata?: Record<string, unknown> | null;
  }): Promise<number> {
    const query = `
    INSERT INTO front.agrement_history (
      source,
      agrement_id,
      usager_user_id,
      bo_user_id,
      type,
      type_precision,
      metadata,
      created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    RETURNING id;
  `;
    const values = [
      source,
      agrementId,
      null, // usager_user_id
      boUserId ?? null,
      type ?? null,
      typePrecision ?? null,
      metadata ?? null,
    ];
    const { rows } = await getPool().query(query, values);
    return rows[0].id;
  },
  async updateStatut({
    agrementId,
    statut,
    commentaire,
    file,
  }: {
    agrementId: number;
    statut: AGREMENT_STATUT;
    commentaire?: string;
    file?: AgrementFilesDto;
  }): Promise<boolean> {
    const client = await getPool().connect();
    try {
      const result = await client.query(
        `UPDATE front.agrements
          SET
            statut = $1::front.agrement_statut,
            commentaire_refus = CASE
              WHEN $1::text = '${AGREMENT_STATUT.REFUSE}' THEN $3
              ELSE commentaire_refus
            END,
            commentaire_completude = CASE
              WHEN $1::text = '${AGREMENT_STATUT.A_MODIFIER}' THEN $3
              ELSE commentaire_completude
            END,
            updated_at = NOW()
          WHERE id = $2`,
        [statut, agrementId, commentaire],
      );
      if (file) {
        await AgrementsRepository.insertAgrementFiles(client, agrementId, file);
      }
      return result.rowCount > 0;
    } finally {
      client.release();
    }
  },
};
