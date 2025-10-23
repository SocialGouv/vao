import { AgrementStatut } from "../utils/agrementStatus";
import { statusUserFront } from "../utils/status";
import { typeNotification } from "../helpers/notifications";
import * as Sentry from "@sentry/node";
import { notifyAgrementExpiration, sentry } from "../config";
import { pool } from "../db";
import { insertCron } from "../cron/cron.service";
import { sendNotifyAgrementExpirationRow } from "./notifyAgrementExpiration.email";
import { addHistoric } from "../services/Tracking";
import { Actions, Entities, UserTypes } from "../helpers/tracking";
import type {
  UpdateAgrementExpirationRow,
  NotifyAgrementExpirationRow,
} from "./notifyAgrementExpiration.type";
import { logger } from "../utils/logger";
import { Report } from "../utils/report";

const querySelectNotifyAgrementExpiration = `
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

const queryUpdateAgrementExpiration6m = `
  UPDATE front.agrements
    SET last_mail_expiration_6m_at = current_date
    WHERE id = $1
  RETURNING id;
`;

const queryUpdateAgrementExpiration120j = `
  UPDATE front.agrements
    SET last_mail_expiration_120j_at = current_date
    WHERE id = $1
  RETURNING id;
`;

const selectNotifyAgrementExpiration = async () =>
  await pool.query<NotifyAgrementExpirationRow>(
    querySelectNotifyAgrementExpiration,
  );

const updateAgrementExpiration6m = async (id: number) =>
  await pool.query<UpdateAgrementExpirationRow>(
    queryUpdateAgrementExpiration6m,
    [id],
  );

const updateAgrementExpiration120j = async (id: number) =>
  await pool.query<UpdateAgrementExpirationRow>(
    queryUpdateAgrementExpiration120j,
    [id],
  );

export const notifyAgrementExpirationActions = async () => {
  logger.info(`${notifyAgrementExpiration.name} - Start`);
  const startDate = new Date();
  try {
    const { rows } = await selectNotifyAgrementExpiration();
    const report: Report = {
      nbUpdate: 0,
      error: 0,
      success: 0,
      total: 0,
      errors: [] as unknown[],
    };
    if (rows.length > 0) {
      const sentEmails = await sendNotifyAgrementExpirationRow(rows);
      const agrementUpdate = await Promise.all(
        rows.map((row) =>
          row.expiration_type === "6m"
            ? updateAgrementExpiration6m(row.id)
            : updateAgrementExpiration120j(row.id),
        ),
      );
      report.total = sentEmails.total;
      report.success = sentEmails.success;
      report.error = sentEmails.error;
      report.errors = sentEmails.errors;
      report.nbUpdate = agrementUpdate.length;

      const results = await Promise.allSettled(
        rows.map((row) =>
          addHistoric({
            action: Actions.Notification,
            data: {
              typeNotification: typeNotification.inactifDeuxMois,
              user: row,
            },
            entity: Entities.UserFront,
            entityId: row.id,
            userId: row.id,
            userType: UserTypes.Front,
          }),
        ),
      );

      results.forEach((result, index) => {
        if (result.status !== "fulfilled") {
          if (sentry.enabled) {
            Sentry.captureException(
              `Échec pour l’utilisateur ${rows[index].id}`,
              result.reason,
            );
          }
          logger.error(
            `Échec pour l’utilisateur ${rows[index].id}`,
            result.reason,
          );
        }
      });
    }

    const endDate = new Date();

    await insertCron({
      cronName: notifyAgrementExpiration.name,
      startDate,
      endDate,
      report,
    });

    logger.info(`${notifyAgrementExpiration.name} - End`);
  } catch (error) {
    if (sentry.enabled) {
      Sentry.captureException(error);
    }
    logger.error(error);
    throw error;
  }
};
