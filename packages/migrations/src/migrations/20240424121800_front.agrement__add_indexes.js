/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("front")
    .alterTable("agrements", function (table) {
      table.index("organisme_id", "agrements__organisme_id__index", {
        indexType: "FULLTEXT",
      });
      table.index("supprime", "agrements__supprime__index", {
        indexType: "FULLTEXT",
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
    .alterTable("agrements", function (table) {
      table.dropIndex("_organisme_id_");
      table.dropIndex("_supprime_");
    });
};
