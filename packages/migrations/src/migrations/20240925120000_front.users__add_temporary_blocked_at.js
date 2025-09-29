/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("front")
    .alterTable("users", function (table) {
      table.timestamp("temporary_blocked_at").nullable();
    })
    .then(() => {
      return knex.raw(
        "ALTER TYPE user_status ADD VALUE IF NOT EXISTS 'TEMPORARY_BLOCKED';",
      );
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("front").alterTable("users", (table) => {
    table.dropColumn("temporary_blocked_at");
  });
};