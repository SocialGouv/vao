/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("front")
    .alterTable("demande_sejour_history", function (table) {
      table.dropForeign(
        "demande_sejour_id",
        "demande_sejour_history_demande_sejour_id_fkey",
      );
      table
        .foreign("demande_sejour_id")
        .references("id")
        .inTable("front.demande_sejour")
        .onDelete("CASCADE")
        .withKeyName("demande_sejour_history_demande_sejour_id_fkey");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("front")
    .alterTable("demande_sejour_history", function (table) {
      table.dropForeign(
        "demande_sejour_id",
        "demande_sejour_history_demande_sejour_id_fkey",
      );
      table
        .foreign("demande_sejour_id")
        .references("id")
        .inTable("front.demande_sejour")
        .withKeyName("demande_sejour_history_demande_sejour_id_fkey");
    });
};
