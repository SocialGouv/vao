const { CronJob } = require("cron");
const run = require("../run");
const logger = require("../../utils/logger");
const pool = require("../../utils/pgpool").getPool();
const { statuts } = require("../../helpers/ds-statuts");
const DemandeSejour = require("../../services/DemandeSejour");

const { name, cron } = require("../../config").crons.request.update;

const log = logger(module.filename);

const query = {
  fetchSelectAbandonDeclarations: `
    SELECT id, statut 
    FROM front.demande_sejour
      WHERE (date_debut::date < now()::date)
      AND statut in ('${statuts.ATTENTE_8_JOUR}','${statuts.A_MODIFIER}','${statuts.A_MODIFIER_8J}');
  `,
  fetchUpdateEnCoursDeclarations: `
    UPDATE front.demande_sejour 
      SET statut = '${statuts.SEJOUR_EN_COURS}',
      edited_at = NOW()
      WHERE (date_debut::date <= now()::date)
      AND statut = '${statuts.VALIDEE_8J}';
    `,
  fetchUpdateTermineDeclarations: `
    UPDATE front.demande_sejour 
      SET statut = '${statuts.TERMINEE}',
      edited_at = NOW()
      WHERE (date_fin::date < now()::date)
      AND statut in ('${statuts.VALIDEE_8J}', '${statuts.SEJOUR_EN_COURS}');
    `,
  updateAbandonDeclaration: `
    UPDATE front.demande_sejour 
      SET statut = '${statuts.ABANDONNEE}',
      edited_at = NOW()
      WHERE id = $1;
    `,
};

const action = async () => {
  log.i(`updateStatutDS - IN`);
  try {
    const SourceEvent = "Automate Plateforme VAO";
    const typeEvent = "automate";
    const listeDSAbandon = await pool.query(
      query.fetchSelectAbandonDeclarations,
    );
    if (listeDSAbandon && listeDSAbandon.rowCount > 0) {
      await Promise.all(
        listeDSAbandon.rows.map(async (ds) => {
          await Promise.all([
            DemandeSejour.insertEvent(
              SourceEvent,
              ds.id,
              null,
              null,
              typeEvent,
              "Annulation automatique de la déclaration : date de début du séjour dépassée",
              {},
            ),
            DemandeSejour.insertEvent(
              SourceEvent,
              ds.id,
              null,
              null,
              typeEvent,
              "Statut précédent l'annulation : " + ds.statut,
              {},
            ),
          ]);
          await pool.query(query.updateAbandonDeclaration, [ds.id]);
        }),
      );
    }
    await Promise.all([
      pool.query(query.fetchUpdateEnCoursDeclarations),
      pool.query(query.fetchUpdateTermineDeclarations),
    ]);
  } catch (error) {
    log.w(error);
  }
  log.i(`updateStatutDS - DONE`);
};

const job = new CronJob(cron, run(name, action));

module.exports.job = job;
module.exports.action = action;
