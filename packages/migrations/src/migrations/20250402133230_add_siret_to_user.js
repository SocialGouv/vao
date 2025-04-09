/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("front")
    .alterTable("users", (table) => {
      table.string("siret", 14).nullable();
    })
    .then(() => {
      return knex.raw(
        "ALTER TYPE user_status ADD VALUE IF NOT EXISTS 'NEED_SIRET_VALIDATION';",
      );
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("front").alterTable("users", (table) => {
    table.dropColumn("siret");
  });
};
