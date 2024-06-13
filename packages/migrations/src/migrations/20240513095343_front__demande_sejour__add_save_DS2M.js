/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.up = function (knex) {
  return knex.schema
    .withSchema("front")
    .alterTable("demande_sejour", function (table) {
      table.jsonb("declaration_2m");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("front")
    .alterTable("demande_sejour", function (table) {
      table.dropColumn("declaration_2m");
    });
};
