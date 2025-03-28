import { status } from "../utils/status";
import { pool } from "../db";
import { insertCron } from "../cron/cron.service";
import type {
  InsertEventParams,
  InsertEventRow,
  UpdateEnCoursDeclarationsRow,
  UpdateTermineDeclarationsRow,
  SelectAbandonDeclarationsRow,
} from "./updateStatusDs.type";
import { sentry, updateStatusDs } from "../config";
import * as Sentry from "@sentry/node";
import { logger } from "../utils/logger";

const querySelectAbandonDeclarations = `
  SELECT id, statut
  FROM front.demande_sejour
    WHERE (date_debut::date < now()::date)
    AND statut in ('${status.ATTENTE_8_JOUR}','${status.A_MODIFIER}','${status.A_MODIFIER_8J}');
`;

const queryUpdateEnCoursDeclarations = `
  UPDATE front.demande_sejour
    SET statut = '${status.SEJOUR_EN_COURS}',
    edited_at = NOW()
    WHERE (date_debut::date <= now()::date)
    AND statut = '${status.VALIDEE_8J}'
  RETURNING id;
`;

const queryUpdateTermineDeclarations = `
  UPDATE front.demande_sejour
    SET statut = '${status.TERMINEE}',
    edited_at = NOW()
    WHERE (date_fin::date < now()::date)
    AND statut in ('${status.VALIDEE_8J}', '${status.SEJOUR_EN_COURS}')
  RETURNING id;
`;

const queryUpdateAbandonDeclaration = `
  UPDATE front.demande_sejour
    SET statut = '${status.ABANDONNEE}',
    edited_at = NOW()
    WHERE id = $1
  RETURNING id;
`;

const queryInsertEvent = `
  INSERT INTO front.demande_sejour_history(
    source,
    demande_sejour_id,
    usager_user_id,
    bo_user_id,
    type,
    type_precision,
    metadata,
    created_at,
    edited_at
  )
  VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW())
  RETURNING
    id as "eventId"
`;

const selectAbandonDeclarations = async () =>
  await pool.query<SelectAbandonDeclarationsRow>(
    querySelectAbandonDeclarations,
  );

const insertEvent = async (values: InsertEventParams) =>
  await pool.query<InsertEventRow>(queryInsertEvent, Object.values(values));

const updateAbandonDeclaration = async (id: number) =>
  await pool.query<SelectAbandonDeclarationsRow>(
    queryUpdateAbandonDeclaration,
    [id],
  );

const autoUpdateAbandonDeclarations = async () => {
  const listeDSAbandon = await selectAbandonDeclarations();
  if (listeDSAbandon?.rowCount) {
    return await Promise.all(
      listeDSAbandon.rows.map(async ({ statut, id }) =>
        autoUpdateAbandonDeclaration(id, statut),
      ),
    );
  }
  return [];
};

const autoUpdateAbandonDeclaration = async (id: number, statut: string) => {
  const source = "Automate Plateforme VAO";
  const type = "automate";
  return await Promise.all([
    insertEvent({
      source,
      demande_sejour_id: id,
      usager_user_id: null,
      bo_user_id: null,
      type,
      type_precision:
        "Annulation automatique de la déclaration : date de début du séjour dépassée",
      metadata: {},
    }),
    insertEvent({
      source,
      demande_sejour_id: id,
      usager_user_id: null,
      bo_user_id: null,
      type,
      type_precision: `Statut précédent l'annulation : ${statut}`,
      metadata: {},
    }),
    updateAbandonDeclaration(id),
  ]);
};

export const updateStatusDsAction = async () => {
  logger.info(`${updateStatusDs.name} - Start`);
  const startDate = new Date();
  try {
    const responses = await Promise.all([
      autoUpdateAbandonDeclarations(),
      pool.query<UpdateEnCoursDeclarationsRow>(queryUpdateEnCoursDeclarations),
      pool.query<UpdateTermineDeclarationsRow>(queryUpdateTermineDeclarations),
    ]);
    const endDate = new Date();
    await insertCron({
      cronName: updateStatusDs.name,
      startDate,
      endDate,
      report: {
        nbAbandon: responses[0].length,
        nbEnCours: responses[1].rowCount,
        nbTermine: responses[2].rowCount,
      },
    });
    logger.info(`${updateStatusDs.name} - End`);
  } catch (error) {
    if (sentry.enabled) {
      Sentry.captureException(error);
    }
    logger.error(error);
    throw error;
  }
};
