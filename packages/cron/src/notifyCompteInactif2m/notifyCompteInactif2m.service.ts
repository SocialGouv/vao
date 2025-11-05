import { STATUS_USER_FRONT } from "@vao/shared-bridge";
import { typeNotification } from "../helpers/notifications";
import * as Sentry from "@sentry/node";
import { notifyCompteInactif2m, sentry } from "../config";
import { pool } from "../db";
import { insertCron } from "../cron/cron.service";
import { sendNotifyCompteInactif2mRow } from "./notifyCompteInactif2m.email";
import { addHistoric } from "../services/Tracking";
import { Actions, Entities, UserTypes } from "../helpers/tracking";
import type {
  UpdateCompteInactif2mRow,
  NotifyCompteInactif2mRow,
} from "./notifyCompteInactif2mtype";
import { logger } from "../utils/logger";
import { Report } from "../utils/report";

const querySelectNotifyCompteInactif2m = `
  SELECT id, mail, status_code, created_at, lastconnection_at
  FROM front.users
  WHERE lastconnection_at >= current_date - interval '3 month'  
    AND lastconnection_at  < current_date - interval '2 month'
    AND last_mail_inactivity_2m_at is null
    AND status_code not in ('${STATUS_USER_FRONT.BLOCKED}', '${STATUS_USER_FRONT.NEED_SIRET_VALIDATION}');
`;

const queryUpdateUserNotification2m = `
  UPDATE front.users
    SET last_mail_inactivity_2m_at = current_date
    WHERE id = $1
  RETURNING id;
`;

const selectNotifyCompteInactif2m = async () =>
  await pool.query<NotifyCompteInactif2mRow>(querySelectNotifyCompteInactif2m);

const updateUser2m = async (id: number) =>
  await pool.query<UpdateCompteInactif2mRow>(queryUpdateUserNotification2m, [
    id,
  ]);

export const notifyCompteInactif2mActions = async () => {
  logger.info(`${notifyCompteInactif2m.name} - Start`);
  const startDate = new Date();
  try {
    const { rows } = await selectNotifyCompteInactif2m();
    const report: Report = {
      nbUpdate: 0,
      error: 0,
      success: 0,
      total: 0,
      errors: [] as unknown[],
    };
    if (rows.length > 0) {
      const deadlineDesactivation = new Date();
      deadlineDesactivation.setMonth(deadlineDesactivation.getMonth() + 1);

      const formattedDeadline = deadlineDesactivation.toLocaleDateString(
        "fr-FR",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        },
      );
      const sentEmails = await sendNotifyCompteInactif2mRow(
        rows,
        formattedDeadline,
      );
      const userUpdate = await Promise.all(
        rows.map((row) => updateUser2m(row.id)),
      );
      report.total = sentEmails.total;
      report.success = sentEmails.success;
      report.error = sentEmails.error;
      report.errors = sentEmails.errors;
      report.nbUpdate = userUpdate.length;

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
      cronName: notifyCompteInactif2m.name,
      startDate,
      endDate,
      report,
    });

    logger.info(`${notifyCompteInactif2m.name} - End`);
  } catch (error) {
    if (sentry.enabled) {
      Sentry.captureException(error);
    }
    logger.error(error);
    throw error;
  }
};
