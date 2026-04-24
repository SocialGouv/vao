import { AGREMENT_STATUT, AGREMENT_SVA_TIMER_STATUT } from "@vao/shared-bridge";
import { pool } from "../db";
import { UpdateAndNotifySvaRow } from "./updateAndNotifySva.type";

export const UpdateAndNotifySvaRepository = {
  selectSvaToNotify: async (): Promise<UpdateAndNotifySvaRow[]> => {
    const querySelectTempsCumuleSva = `

      WITH periodes_calculees AS (
        SELECT
          t.id,
          COALESCE(SUM((COALESCE(p.end_at::date, CURRENT_DATE) - p.start_at::date)),0) AS jours_cumules
        FROM front.agrement_sva_timer t
          LEFT JOIN front.agrement_sva_periodes p
            ON p.agrement_sva_timer_id = t.id
        GROUP BY t.id
      ),
      parametres AS (
        SELECT ((CURRENT_DATE + INTERVAL '2 months')::date - CURRENT_DATE) AS jours_max
      ),
      calcul_final AS (
        SELECT
          pc.id,
          pc.jours_cumules,
          p.jours_max,
          GREATEST(p.jours_max - pc.jours_cumules, 0) AS jours_restants
        FROM periodes_calculees pc
        CROSS JOIN parametres p
      )
      SELECT
        cf.id,
        cf.jours_cumules,
        cf.jours_max,
        cf.jours_restants,
        CURRENT_DATE + cf.jours_restants::int AS date_fin_previsionnelle,
        t.agrement_id,
        a.date_confirm_completude,
        a.date_depot,
        (t.mail_delay_21d_at IS NULL AND cf.jours_restants <= 21) AS to_notify,
        (cf.jours_restants <= 0) AS to_passed_finished,
        a.region_obtention,
        o.id AS organisme_id,
        COALESCE(pm.raison_sociale, CONCAT(pp.nom_usage, ' ', COALESCE(pp.prenom, ''))) AS organisme_nom,
        COALESCE(pm.adresse, pp.adresse_siege_label) AS organisme_adresse
      FROM calcul_final cf
        INNER JOIN front.agrement_sva_timer t ON t.id = cf.id
        INNER JOIN front.agrements a ON a.id = t.agrement_id
        INNER JOIN front.organismes o ON o.id = a.organisme_id
        LEFT JOIN front.personne_morale pm ON pm.organisme_id = o.id AND pm.current = true
        LEFT JOIN front.personne_physique pp ON pp.organisme_id = o.id AND pp.current = true
      WHERE t.statut IN ('${AGREMENT_SVA_TIMER_STATUT.PAUSED}', '${AGREMENT_SVA_TIMER_STATUT.RUNNING}')
        AND (
            (t.mail_delay_21d_at IS NULL AND cf.jours_restants <= 21)
            OR cf.jours_restants <= 0
        );
      `;

    const response = await pool.query<UpdateAndNotifySvaRow[]>(
      querySelectTempsCumuleSva,
    );
    return response.rows;
  },
  updateMailNotificationSva: async ({ id }: { id: number }): Promise<void> => {
    const query = `
      UPDATE front.agrement_sva_timer
        SET mail_delay_21d_at = current_date
        WHERE id = $1
      RETURNING id;
    `;

    await pool.query(query, [id]);
  },
  updateMailNotificationSvaRollback: async ({
    id,
  }: {
    id: number;
  }): Promise<void> => {
    const query = `
      UPDATE front.agrement_sva_timer
        SET mail_delay_21d_at = null
        WHERE id = $1
      RETURNING id;
    `;

    await pool.query(query, [id]);
  },
  updateStatutSva: async ({
    id,
    client,
  }: {
    id: number;
    client: any;
  }): Promise<void> => {
    const query = `
      UPDATE front.agrement_sva_timer
        SET statut = '${AGREMENT_SVA_TIMER_STATUT.FINISHED}'
        WHERE id = $1
      RETURNING id;
    `;

    await client.query(query, [id]);
  },
  updateStatutAgrement: async ({
    id,
    client,
  }: {
    id: number;
    client: any;
  }): Promise<void> => {
    const query = `
      UPDATE front.agrements
        SET statut = '${AGREMENT_STATUT.VALIDE}'
        WHERE id = $1
      RETURNING id;
    `;

    await client.query(query, [id]);
  },
};
