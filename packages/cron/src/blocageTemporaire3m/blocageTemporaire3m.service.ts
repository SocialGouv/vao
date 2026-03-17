import { pool } from "../db";
import { STATUS_USER_FRONT } from "@vao/shared-bridge";
import { logger } from "../utils/logger";
import * as Sentry from "@sentry/node";
import { disableAccount3m, sentry } from "../config";
import { insertCron } from "../cron/cron.service";
import { addHistoric } from "../services/Tracking";
import { Actions, Entities, UserTypes } from "../helpers/tracking";
import type { BlocageTemporaire3mRow } from "./blocageTemporaire3mtype";
import { sendBlocageTemporaire3mRow } from "./blocageTemporaire3m.email";

const querySelectUsersToBlock = `
  SELECT id, mail
  FROM front.users
  WHERE lastconnection_at < current_date - interval '3 month'
    AND status_code = '${STATUS_USER_FRONT.VALIDATED}'
    AND last_mail_inactivity_2m_at IS NOT NULL
    AND temporary_blocked_at IS NULL
    AND deleted = false
`;

const queryBlockUser = `
  UPDATE front.users
  SET status_code = '${STATUS_USER_FRONT.TEMPORARY_BLOCKED}',
      temporary_blocked_at = NOW()
  WHERE id = $1
`;

const queryUnblockUser = `
  UPDATE front.users
  SET status_code = '${STATUS_USER_FRONT.VALIDATED}',
      temporary_blocked_at = NULL
  WHERE id = $1
`;

export const blocageTemporaire3mActions = async () => {
  logger.info(`${disableAccount3m.name} - Start`);
  const startDate = new Date();
  const report = {
    nbUpdate: 0,
    error: 0,
    success: 0,
    total: 0,
    errors: [] as unknown[],
  };
  try {
    const { rows }: { rows: BlocageTemporaire3mRow[] } = await pool.query(
      querySelectUsersToBlock,
    );
    report.total = rows.length;
    for (const { id, mail } of rows) {
      await pool.query(queryBlockUser, [id]);
      await addHistoric({
        action: Actions.Deactivation,
        data: { reason: "Blocage temporaire après 3 mois d'inactivité" },
        entity: Entities.UserFront,
        entityId: id,
        userId: id,
        userType: UserTypes.Front,
      });
      try {
        await sendBlocageTemporaire3mRow({ id, mail });
        report.nbUpdate++;
        report.success++;
        logger.info(`User ${id} temporarily blocked and notified`);
      } catch (emailErr) {
        // rollback si mail fails
        await pool.query(queryUnblockUser, [id]);
        report.error++;
        report.errors.push({ id, error: emailErr, rollback: true });
        logger.error(
          `Email failed for user ${id}, rollback performed`,
          emailErr,
        );
        if (sentry && sentry.enabled) {
          Sentry.captureException(emailErr);
        }
        throw emailErr;
      }
    }
    const endDate = new Date();
    await insertCron({
      cronName: disableAccount3m.name,
      startDate,
      endDate,
      report,
    });
    logger.info(`${disableAccount3m.name} - End`);
  } catch (error) {
    if (sentry && sentry.enabled) {
      Sentry.captureException(error);
    }
    logger.error(`${disableAccount3m.name} - Error`, error);
    throw error;
  }
};
