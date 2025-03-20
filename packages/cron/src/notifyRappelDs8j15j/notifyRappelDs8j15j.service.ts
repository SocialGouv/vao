import { status } from "../utils/status";
import * as Sentry from "@sentry/node";
import { notifyDs8jDs15, sentry } from "../config";
import { pool } from "../db";
import { insertCron } from "../cron/cron.service";
import { sendRappelDeclarationEmails } from "./notifyRappelDs8j15j.email";
import type {
  UpdateRappelRow,
  RappelDeclarationSejour8j15jRow,
} from "./notifyRappelDs8j15j.type";
import { logger } from "../utils/logger";

const { deadlineRemind } = notifyDs8jDs15;

const querySelectRappelDeclarationSejour8j15j = `
  SELECT
    ds.id,
    ds.date_debut,
    ds.statut,
    ds.libelle as titre,
    TO_CHAR((ds.date_debut - (('${deadlineRemind}'+8) * INTERVAL '1 day'))::date, 'DD/MM/YYYY') as "dateDebutAlerte",
    use.mail
  FROM front.demande_sejour ds
  INNER JOIN front.user_organisme uso on uso.org_id = ds.organisme_id
  INNER JOIN front.users use on use.id = uso.use_id
  WHERE (ds.date_debut - (('${deadlineRemind}'+8) * INTERVAL '1 day'))::date<= now()::date
  AND now()::date<=(ds.date_debut - (8 * INTERVAL '1 day'))::date
  AND ds.statut = '${status.ATTENTE_8_JOUR}'
  AND ds.rappel_ds_compl = false;
`;

const queryUpdateRappel = `
UPDATE front.demande_sejour
  SET rappel_ds_compl = true
  WHERE id = $1
RETURNING
  id;
`;

const selectRappelDeclarationSejour8j15j = async () =>
  await pool.query<RappelDeclarationSejour8j15jRow>(
    querySelectRappelDeclarationSejour8j15j,
  );

const updateRappel = async (id: number) =>
  await pool.query<UpdateRappelRow>(queryUpdateRappel, [id]);

export const notifyRappelDeclarationSejourActions = async () => {
  logger.info(`${notifyDs8jDs15.name} - Start`);
  const startDate = new Date();
  try {
    const { rows } = await selectRappelDeclarationSejour8j15j();
    const report = {
      nbUpdate: 0,
      error: 0,
      success: 0,
      total: 0,
      errors: [] as unknown[],
    };
    if (rows.length > 0) {
      const sentEmails = await sendRappelDeclarationEmails(
        rows,
        deadlineRemind,
      );
      const dsUpdate = await Promise.all(
        rows.map((row) => updateRappel(row.id)),
      );
      report.total = sentEmails.total;
      report.success = sentEmails.success;
      report.error = sentEmails.error;
      report.errors = sentEmails.errors;
      report.nbUpdate = dsUpdate.length;
    }
    const endDate = new Date();
    await insertCron({
      cronName: notifyDs8jDs15.name,
      startDate,
      endDate,
      report,
    });
    logger.info(`${notifyDs8jDs15.name} - End`);
  } catch (error) {
    if (sentry.enabled) {
      Sentry.captureException(error);
    }
    logger.error(error);
    throw error;
  }
};
