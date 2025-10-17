import { pool } from "../db";
import { statusUserFront } from "../utils/status";
import { sendSuppressionCompteInactifEmail } from "./suppressionCompteInactif.email";
import { insertCron } from "../cron/cron.service";
import { logger } from "../utils/logger";
import {
  SuppressionCompteInactifRow,
  SuppressionCompteInactifReport,
} from "./suppressionCompteInactif.type";

const querySelectComptesASupprimer = `
  SELECT
    us.id,
    us.mail,
    us.lastconnection_at,
    us.status_code
  FROM front.users AS us
  LEFT JOIN front.user_organisme AS uo ON uo.use_id = us.id
  LEFT JOIN front.organismes AS org ON org.id = uo.org_id
  WHERE us.status_code = '${statusUserFront.TEMPORARY_BLOCKED}'
    AND us.lastconnection_at < NOW() - INTERVAL '180 days'
    AND us.planned_deletion_at IS NOT NULL
    AND us.planned_deletion_at <= NOW()
    AND NOT EXISTS (
      SELECT 1 FROM front.demande_sejour ds WHERE ds.organisme_id = org.id
    )
`;

export const selectComptesASupprimer = async () =>
  await pool.query<SuppressionCompteInactifRow>(querySelectComptesASupprimer);

export const suppressionCompteInactifActions = async () => {
  logger.info("suppressionCompteInactifActions - Start");
  const startDate = new Date();
  const report: SuppressionCompteInactifReport = {
    total: 0,
    suppressionsEffectuees: 0,
    emailsEnvoyes: 0,
    erreurs: [],
  };

  const { rows } = await selectComptesASupprimer();
  report.total = rows.length;
  logger.info(`Comptes à supprimer: ${rows.length}`);

  for (const user of rows) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(`DELETE FROM front.user_organisme WHERE use_id = $1`, [
        user.id,
      ]);
      await client.query(`DELETE FROM front.users WHERE id = $1`, [user.id]);
      await client.query("COMMIT");
      logger.info(`Compte supprimé: ${user.mail}`);
      report.suppressionsEffectuees++;
      await sendSuppressionCompteInactifEmail({ to: user.mail });
      report.emailsEnvoyes++;
    } catch (err) {
      await client.query("ROLLBACK");
      report.erreurs.push(`User ${user.id}: ${String(err)}`);
      logger.error(
        `Suppression ou email échoué pour l'utilisateur ${user.id}`,
        err,
      );
    } finally {
      client.release();
    }
  }

  const endDate = new Date();
  await insertCron({
    cronName: "suppressionCompteInactif",
    startDate,
    endDate,
    report,
  });
  logger.info("suppressionCompteInactifActions - End");
};
