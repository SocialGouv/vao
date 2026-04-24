import type {
  AGREMENT_SVA_TIMER_STATUT,
  AgrementDto,
  AgrementMessage,
} from "@vao/shared-bridge";
import { USER_TYPE } from "@vao/shared-bridge";

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
    const query = `
      SELECT id, code, libelle, activite_type
      FROM front.activite
      ORDER BY libelle ASC;
    `;
    const result = await getPool().query(query);

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

  async getMessages(
    agrementId: number,
    userType: USER_TYPE,
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
          bu.prenom AS "backUserPrenom",
          fu.prenom AS "frontUserPrenom"
        FROM front.agrement_messagerie m
        LEFT JOIN back.users bu ON bu.id = m.back_user_id
        LEFT JOIN front.users fu ON fu.id = m.front_user_id
        WHERE m.agrement_id = $1
        ORDER BY m.created_at ASC
      `;
      const messagesResult = await client.query(messagesQuery, [agrementId]);
      const unreadColumn =
        userType === USER_TYPE.BO ? "back_user_id" : "front_user_id";

      const unreadQuery = `
          SELECT COUNT(*) AS unread_count
          FROM front.agrement_messagerie
          WHERE agrement_id = $1
            AND ${unreadColumn} IS NULL
            AND read_at IS NULL
        `;
      const unreadResult = await client.query(unreadQuery, [agrementId]);
      const unreadCount = Number(unreadResult.rows[0].unread_count);

      return {
        messages: messagesResult.rows.map((row: AgrementMessage) => ({
          ...row,
          created_at: row.created_at?.toString(),
          read_at: row.read_at ? row.read_at.toString() : null,
        })) as AgrementMessage[],
        unreadCount,
      };
    } finally {
      client.release();
    }
  },
  async insertMessage({
    agrementId,
    userType,
    userId,
    message,
  }: {
    agrementId: number;
    userType: USER_TYPE;
    userId: number;
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
      const ovaUserId = userType === USER_TYPE.FU ? userId : null;
      const backUserId = userType === USER_TYPE.BO ? userId : null;
      const values = [agrementId, ovaUserId, backUserId, message, null];
      const result = await client.query(query, values);
      return result.rows[0]?.id ?? 0;
    } finally {
      client.release();
    }
  },
  async insertSvaPeriode({
    client,
    timerId,
  }: {
    client: any;
    timerId: number;
  }): Promise<void> {
    await client.query(
      `INSERT INTO front.agrement_sva_periodes (agrement_sva_timer_id, start_at)
         VALUES ($1,NOW())`,
      [timerId],
    );
  },
  async markMessagesAsRead({
    agrementId,
    userType,
  }: {
    agrementId: number;
    userType: USER_TYPE;
  }): Promise<number> {
    const client = await getPool().connect();
    try {
      const unreadColumn =
        userType === USER_TYPE.FU ? "back_user_id" : "front_user_id";
      const query = `
      UPDATE front.agrement_messagerie
      SET read_at = NOW()
      WHERE agrement_id = $1
        AND  ${unreadColumn} IS NOT NULL
        AND read_at IS NULL
      RETURNING id;
    `;
      const result = await client.query(query, [agrementId]);
      return result.rowCount;
    } finally {
      client.release();
    }
  },
  async updateSvaPeriode({
    client,
    timerId,
  }: {
    client: any;
    timerId: number;
  }): Promise<number> {
    const { id } = await client.query(
      "UPDATE front.agrement_sva_timer SET end_at = NOW() WHERE id = $1 AND end_at IS NULL RETURNING id",
      [timerId],
    );
    return id;
  },
  async updateSvaTimer({
    client,
    agrementId,
    statut,
  }: {
    client: any;
    agrementId: number;
    statut: AGREMENT_SVA_TIMER_STATUT;
  }): Promise<number> {
    const result = await client.query(
      "UPDATE front.agrement_sva_timer SET statut = $2, updated_at = NOW() WHERE agrement_id = $1 RETURNING id",
      [agrementId, statut],
    );
    return result.rows[0]?.id ?? null;
  },
};
