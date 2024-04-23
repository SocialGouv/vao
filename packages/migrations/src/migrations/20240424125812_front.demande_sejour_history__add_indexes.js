/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("front")
    .alterTable("demande_sejour_history", function (table) {
      table.index(
        "demande_sejour_id",
        "demande_sejour_history__demande_sejour_id__index",
        {
          indexType: "FULLTEXT",
        },
      );
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
      table.dropIndex("_demande_sejour_id_");
    });
};
