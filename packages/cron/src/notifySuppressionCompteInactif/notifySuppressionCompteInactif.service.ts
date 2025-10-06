import { pool } from "../db";
import * as Sentry from "@sentry/node";
import { logger } from "../utils/logger";
import { insertCron } from "../cron/cron.service";
import { sendNotifyCompteInactif2mEmails } from "./notifySuppressionCompteInactif.email";
import { statusUserFront } from "../utils/status";
import { notifySuppressionCompteInactif, sentry } from "../config";
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
  WHERE us.status_code = '${statusUserFront.TEMPORARY_BLOCKED}'
  GROUP BY us.id, us.mail, us.lastconnection_at, us.status_code,
           us.last_mail_inactivity_5m_at, us.last_mail_inactivity_5m_reminder_at, us.planned_deletion_at
`;


export const selectComptesInactifs = async () =>
  await pool.query<NotifySuppressionCompteInactifRow>(querySelectComptesInactifs);

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
    const { rows } = await selectComptesInactifs();
    report.total = rows.length;
  const avecDemande = rows.filter((row) => Number(row.nombreDemandes) > 0);
  const sansDemande = rows.filter((row) => Number(row.nombreDemandes) === 0);
    report.avecDemande = avecDemande.length;
    report.sansDemande = sansDemande.length;

    // comptes sans demande de séjour
    const now = new Date();
    // Alerte à 5 mois
    const alertRows = sansDemande.filter(row => {
      if (row.last_mail_inactivity_5m_at) return false;
      const lastConnection = new Date(row.lastconnection_at);
      return (now.getTime() - lastConnection.getTime()) >= 150 * 24 * 60 * 60 * 1000;
    });
    if (alertRows.length > 0) {
      const dateSuppressionDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const dateSuppression = dateSuppressionDate.toLocaleDateString("fr-FR");
      await sendNotifyCompteInactif2mEmails(alertRows, dateSuppression, "ALERTE_5M");
      report.alertesEnvoyees = alertRows.length;
      // Mise à jour colonnes en base
      for (const row of alertRows) {
        await pool.query(
          `UPDATE front.users
           SET last_mail_inactivity_5m_at = NOW(),
               planned_deletion_at = $2
           WHERE id = $1`,
          [row.id, dateSuppressionDate]
        );
      }
    }

    // Rappel à J-7
    const rappelRows = sansDemande.filter(row => {
      if (!row.last_mail_inactivity_5m_at || row.last_mail_inactivity_5m_reminder_at) return false;
      const dateAlerte = new Date(row.last_mail_inactivity_5m_at);
      return (now.getTime() - dateAlerte.getTime()) >= 23 * 24 * 60 * 60 * 1000;
    });
    if (rappelRows.length > 0) {
      const dateSuppressionDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const dateSuppression = dateSuppressionDate.toLocaleDateString("fr-FR");
      await sendNotifyCompteInactif2mEmails(rappelRows, dateSuppression, "RAPPEL_J7");
      report.rappelsEnvoyes = rappelRows.length;
      // Mise à jour colonne en base
      for (const row of rappelRows) {
        await pool.query(
          `UPDATE front.users
           SET last_mail_inactivity_5m_reminder_at = NOW()
           WHERE id = $1`,
          [row.id]
        );
      }
    }

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