import type {
  AGREMENT_HISTORY_TYPE,
  AgrementHistoryItem,
  AgrementHistoryRow,
  AgrementMessage,
} from "@vao/shared-bridge";
import {
  AGREMENT_STATUT,
  AgrementDto,
  PaginationQueryDto,
} from "@vao/shared-bridge";

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
  async getById(agrementId: number): Promise<AgrementDto | null> {
    const client = await getPool().connect();
    try {
      const result = await client.query(
        `SELECT a.*, pm.raison_sociale
       FROM front.agrements a
       JOIN front.organismes o ON a.organisme_id = o.id
       LEFT JOIN front.personne_morale pm ON pm.organisme_id = o.id AND pm.current = true
       WHERE a.id = $1
       LIMIT 1;`,
        [agrementId],
      );
      if (result.rows.length === 0) {
        return null;
      }
      return AgrementsMapper.toModel(result.rows[0]);
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

  async getMessages(
    agrementId: number,
  ): Promise<{ messages: AgrementMessage[]; unreadCount: number }> {
    const client = await getPool().connect();
    try {
      const messagesQuery = `
      SELECT
        m.id,
        m.agrement_id,
        m.front_user_id,
        m.back_user_id,
        m.message,
        m.created_at,
        m.read_at,
        bu.prenom AS "backUserPrenom"
      FROM front.agrement_messagerie m
      LEFT JOIN back.users bu ON bu.id = m.back_user_id
      WHERE m.agrement_id = $1
      ORDER BY m.created_at ASC
    `;
      const messagesResult = await client.query(messagesQuery, [agrementId]);

      const unreadQuery = `
      SELECT COUNT(*) AS unread_count
      FROM front.agrement_messagerie
      WHERE agrement_id = $1 AND read_at IS NULL
    `;
      const unreadResult = await client.query(unreadQuery, [agrementId]);
      const unreadCount = Number(unreadResult.rows[0].unread_count);

      return {
        messages: messagesResult.rows as AgrementMessage[],
        unreadCount,
      };
    } finally {
      client.release();
    }
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
  async insertMessage({
    agrementId,
    backUserId,
    message,
  }: {
    agrementId: number;
    backUserId: number;
    message: string;
  }): Promise<number> {
    const client = await getPool().connect();
    try {
      const query = `
      INSERT INTO front.agrement_messagerie (
        agrement_id,
        front_user_id,
        back_user_id,
        message,
        created_at,
        read_at
      ) VALUES ($1, $2, $3, $4, NOW(), $5)
      RETURNING id;
    `;
      const values = [agrementId, null, backUserId, message, null];
      const result = await client.query(query, values);
      return result.rows[0]?.id ?? 0;
    } finally {
      client.release();
    }
  },
  async markMessagesAsRead(agrementId: number): Promise<number> {
    const client = await getPool().connect();
    try {
      const query = `
      UPDATE front.agrement_messagerie
      SET read_at = NOW()
      WHERE agrement_id = $1 AND read_at IS NULL
      RETURNING id;
    `;
      const result = await client.query(query, [agrementId]);
      return result.rowCount;
    } finally {
      client.release();
    }
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
