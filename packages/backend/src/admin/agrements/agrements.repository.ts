import type { AGREMENT_HISTORY_TYPE } from "@vao/shared-bridge";
import { AGREMENT_STATUT, AgrementDto } from "@vao/shared-bridge";
import { PaginationQueryDto } from "@vao/shared-bridge/src/dto/paginationQueryDto";

import { processQuery } from "../../helpers/queryParams";
import { AgrementEntity } from "../../shared/agrements/agrements.entity";
import { AgrementsMapper } from "../../shared/agrements/agrements.mapper";
import Logger from "../../utils/logger";
import { getPool } from "../../utils/pgpool";

const log = Logger(module.filename);
// ------------------------------------------------------------
// 🏗️ Repository Admin
// ------------------------------------------------------------
export const AgrementsRepository = {
  /**
   * Récupère un agrément par son ID.
   */
  async getById(agrementId: number): Promise<AgrementEntity | null> {
    const client = await getPool().connect();
    try {
      const result = await client.query(
        `SELECT * FROM front.agrements WHERE id = $1 LIMIT 1;`,
        [agrementId],
      );
      if (result.rows.length === 0) {
        return null;
      }
      return result.rows[0] as AgrementEntity;
    } finally {
      client.release();
    }
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
  }: {
    agrementId: number;
    statut: AGREMENT_STATUT;
  }): Promise<boolean> {
    const client = await getPool().connect();
    try {
      const result = await client.query(
        `UPDATE front.agrements SET statut = $1, updated_at = NOW() WHERE id = $2`,
        [statut, agrementId],
      );
      return result.rowCount > 0;
    } finally {
      client.release();
    }
  },
};
