/**
 * Migration pour augmenter la taille du champ category dans agrement_files
 * PostgreSQL + Knex.js
 */

exports.up = async function (knex) {
  await knex.schema.alterTable("front.agrement_files", function (table) {
    table.string("category", 50).alter();
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("front.agrement_files", function (table) {
    table.string("category", 30).alter();
  });
};
