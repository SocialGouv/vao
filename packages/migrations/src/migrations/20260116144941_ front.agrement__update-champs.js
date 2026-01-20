/**
 * Migration complète du modèle des "agréments"
 * PostgreSQL + Knex.js
 */

exports.up = async function (knex) {
  await knex.schema.raw(`
    ALTER TABLE front.agrements
    ALTER COLUMN bilan_changement_evolution TYPE text
    USING bilan_changement_evolution::text;
  `);
  // --- ALTER TABLE agrements ---
  await knex.schema
    .withSchema("front")
    .alterTable("agrements", function (table) {
      table.text("budget_perso_gestion_complementaire");
    });
};

exports.down = async function (knex) {
  await knex.schema.raw(`
    ALTER TABLE front.agrements
    ALTER COLUMN bilan_changement_evolution TYPE boolean
    USING bilan_changement_evolution::boolean;
  `);
  await knex.schema
    .withSchema("front")
    .alterTable("agrements", function (table) {
      table.dropColumn("budget_perso_gestion_complementaire");
    });
};
