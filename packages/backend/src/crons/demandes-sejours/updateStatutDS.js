const { CronJob } = require("cron");
const run = require("../run");
const logger = require("../../utils/logger");
const pool = require("../../utils/pgpool").getPool();
const { statuts } = require("../../helpers/ds-statuts");

const { name, cron } = require("../../config").crons.request.update;

const log = logger(module.filename);

const query = {
  fetchUpdateAbandonDeclarations: `
    UPDATE front.demande_sejour 
      SET statut = '${statuts.ABANDONNEE}'
      WHERE (date_debut::date < now()::date)
      AND statut in ('${statuts.ATTENTE_8_JOUR}','${statuts.A_MODIFIER}','${statuts.A_MODIFIER_8J}');
    `,
  fetchUpdateEnCoursDeclarations: `
    UPDATE front.demande_sejour 
      SET statut = '${statuts.SEJOUR_EN_COURS}'
      WHERE (date_debut::date <= now()::date)
      AND statut = '${statuts.VALIDEE_8J}';
    `,
  fetchUpdateTermineDeclarations: `
    UPDATE front.demande_sejour 
      SET statut = '${statuts.TERMINEE}'
      WHERE (date_fin::date < now()::date)
      AND statut in ('${statuts.VALIDEE_8J}', '${statuts.SEJOUR_EN_COURS}');
    `,
};

const action = async () => {
  log.i(`updateStatutDS - IN`);
  try {
    await pool.query(query.fetchUpdateAbandonDeclarations);
    await pool.query(query.fetchUpdateEnCoursDeclarations);
    await pool.query(query.fetchUpdateTermineDeclarations);
  } catch (error) {
    log.w(error);
  }
  log.i(`updateStatutDS - DONE`);
};

const job = new CronJob(cron, run(name, action));

module.exports.job = job;
module.exports.action = action;
