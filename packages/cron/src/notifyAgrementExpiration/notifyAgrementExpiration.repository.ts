import { AgrementStatut } from "../utils/agrementStatus";
import { statusUserFront } from "../utils/status";
import { pool } from "../db";
import type {
  UpdateAgrementExpirationRow,
  NotifyAgrementExpirationRow,
} from "./notifyAgrementExpiration.type";

export const AgrementExpirationRepository = {
  getExpiredAgrements: async () => {
    const query = `
      SELECT
          a.id,
          a.date_fin_validite,
          u.mail,
          COALESCE(pm.raison_sociale, CONCAT(pp.nom_usage, ' ', COALESCE(pp.prenom, ''))) AS organisme_nom,
          CASE
            WHEN current_date = a.date_fin_validite - INTERVAL '6 months'
              AND a.last_mail_expiration_6m_at IS NULL
              THEN '6m'
            WHEN current_date = a.date_fin_validite - INTERVAL '120 days'
              AND a.last_mail_expiration_120j_at IS NULL
              THEN '120j'
          END AS expiration_type
        FROM front.agrements a
        INNER JOIN front.organismes o ON o.id = a.organisme_id
        INNER JOIN front.user_organisme uo ON uo.org_id = o.id
        INNER JOIN front.users u ON uo.use_id = u.id
        LEFT JOIN front.personne_morale pm ON pm.organisme_id = o.id
        LEFT JOIN front.personne_physique pp ON pp.organisme_id = o.id
        WHERE
          (
            (current_date = a.date_fin_validite - INTERVAL '6 months' AND a.last_mail_expiration_6m_at IS NULL)
            OR
            (current_date = a.date_fin_validite - INTERVAL '120 days' AND a.last_mail_expiration_120j_at IS NULL)
          )
          AND a.statut = '${AgrementStatut.VALIDE}' AND u.status_code = '${statusUserFront.VALIDATED}';
      `;

    const response = await pool.query<NotifyAgrementExpirationRow>(query);
    return {
      expiredAggrements: response.rows,
    };
  },
  updateAgrementExpiration6m: async (id: number) => {
    const query = `
      UPDATE front.agrements
        SET last_mail_expiration_6m_at = current_date
        WHERE id = $1
      RETURNING id;
    `;

    await pool.query<UpdateAgrementExpirationRow>(query, [id]);
  },
  updateAgrementExpiration120j: async (id: number) => {
    const query = `
      UPDATE front.agrements
        SET last_mail_expiration_120j_at = current_date
        WHERE id = $1
      RETURNING id;`;

    await pool.query<UpdateAgrementExpirationRow>(query, [id]);
  },
};
