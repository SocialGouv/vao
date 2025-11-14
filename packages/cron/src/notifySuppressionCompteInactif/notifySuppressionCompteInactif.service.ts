import { pool } from "../db";
import * as Sentry from "@sentry/node";
import { logger } from "../utils/logger";
import { insertCron } from "../cron/cron.service";
import {
  sendAlerte5mEmails,
  sendRappelJ7Emails,
} from "./notifySuppressionCompteInactif.email";
import { statusUserFront } from "@vao/shared-bridge";
import { notifySuppressionCompteInactif, sentry } from "../config";
import { isAfter, addDays, addMonths } from "../utils/date";
import type {
  NotifySuppressionCompteInactifRow,
  SuppressionCompteInactifReport,
} from "./notifySuppressionCompteInactif.type";

const querySelectComptesInactifs = `
  SELECT
    us.id,
    us.mail,
    us.lastconnection_at,
    us.status_code,
    COUNT(ds.id) AS "nombreDemandes",
    us.last_mail_inactivity_5m_at,
    us.last_mail_inactivity_5m_reminder_at,
    us.planned_deletion_at
  FROM front.users AS us
  LEFT JOIN front.user_organisme AS uo ON uo.use_id = us.id
  LEFT JOIN front.organismes AS org ON org.id = uo.org_id
  LEFT JOIN front.demande_sejour AS ds ON ds.organisme_id = org.id
  WHERE us.status_code = $1
  GROUP BY us.id, us.mail, us.lastconnection_at, us.status_code,
           us.last_mail_inactivity_5m_at, us.last_mail_inactivity_5m_reminder_at, us.planned_deletion_at
`;

export const getUsersByStatusCode = async (
  statusCode: keyof typeof statusUserFront,
) =>
  await pool.query<NotifySuppressionCompteInactifRow>(
    querySelectComptesInactifs,
    [statusUserFront[statusCode]],
  );

export const notifySuppressionCompteInactifActions = async () => {
  logger.info(`${notifySuppressionCompteInactif.name} - Start`);
  const startDate = new Date();
  const report: SuppressionCompteInactifReport = {
    total: 0,
    avecDemande: 0,
    sansDemande: 0,
    alertesEnvoyees: 0,
    rappelsEnvoyes: 0,
    suppressionsEffectuees: 0,
    annulations: 0,
    erreurs: [],
  };

  try {
    const { rows: users } = await getUsersByStatusCode(
      statusUserFront.TEMPORARY_BLOCKED,
    );
    report.total = users.length;
    const avecDemande = users.filter((row) => Number(row.nombreDemandes) > 0);
    const sansDemande = users.filter((row) => Number(row.nombreDemandes) === 0);
    report.avecDemande = avecDemande.length;
    report.sansDemande = sansDemande.length;

    const now = new Date();
    await processRappel5mois(sansDemande, now, report);
    await processRappel7jours(sansDemande, now, report);

    const endDate = new Date();
    await insertCron({
      cronName: notifySuppressionCompteInactif.name,
      startDate,
      endDate,
      report,
    });

    logger.info(`${notifySuppressionCompteInactif.name} - End`);
  } catch (error) {
    if (sentry.enabled) {
      Sentry.captureException(error);
    }
    logger.error(error);
    report.erreurs.push(String(error));
    throw error;
  }
};

// Rappel 5 mois
async function processRappel5mois(
  sansDemande: NotifySuppressionCompteInactifRow[],
  now: Date,
  report: SuppressionCompteInactifReport,
) {
  const alertRows = sansDemande.filter((row) => {
    if (row.last_mail_inactivity_5m_at) return false;
    const lastConnection = new Date(row.lastconnection_at);
    // 150 jours d'inactivité
    return isAfter(now, addDays(lastConnection, 150));
  });
  if (alertRows.length > 0) {
    const dateSuppressionDate = addMonths(now, 1);
    await sendAlerte5mEmails(alertRows, dateSuppressionDate);
    report.alertesEnvoyees += alertRows.length;
    // Mise à jour colonnes en base
    for (const row of alertRows) {
      await pool.query(
        `UPDATE front.users
         SET last_mail_inactivity_5m_at = NOW(),
             planned_deletion_at = $2
         WHERE id = $1`,
        [row.id, dateSuppressionDate],
      );
    }
  }
}

// Rappel J-7
async function processRappel7jours(
  sansDemande: NotifySuppressionCompteInactifRow[],
  now: Date,
  report: SuppressionCompteInactifReport,
) {
  const rappelRows = sansDemande.filter((row) => {
    if (
      !row.last_mail_inactivity_5m_at ||
      row.last_mail_inactivity_5m_reminder_at
    )
      return false;
    const dateAlerte = new Date(row.last_mail_inactivity_5m_at);
    // 23 jours après l'alerte
    return isAfter(now, addDays(dateAlerte, 23));
  });
  if (rappelRows.length > 0) {
    const dateSuppressionDate = addDays(now, 7);
    for (const row of rappelRows) {
      try {
        await pool.query(
          `UPDATE front.users
               SET last_mail_inactivity_5m_reminder_at = NOW()
               WHERE id = $1`,
          [row.id],
        );
        await sendRappelJ7Emails([row], dateSuppressionDate);
        report.rappelsEnvoyes++;
      } catch (emailErr) {
        report.erreurs.push(`User ${row.id}: ${String(emailErr)}`);
        logger.error(
          `Le rappel j-7 a échoué pour l'utilisateur ${row.id}`,
          emailErr,
        );
        if (sentry && sentry.enabled) {
          Sentry.captureException(emailErr);
        }
      }
    }
  }
}
