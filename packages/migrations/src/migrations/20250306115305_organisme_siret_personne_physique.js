/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.up = function (knex) {
  return knex.schema
    .withSchema("front")
    .alterTable("personne_physique", function (table) {
      table.string("siret", 14).nullable().unique({
        deferrable: "immediate",
        indexName: "personne_physique_siret",
      });
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("front")
    .alterTable("personne_physique", function (table) {
      table.dropColumn("siret");
    });
};
