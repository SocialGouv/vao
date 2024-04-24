/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("front")
    .alterTable("user_organisme", function (table) {
      table.index("org_id", "user_organisme__org_id__index", {
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
    .alterTable("user_organisme", function (table) {
      table.dropIndex("_org_id_");
    });
};
