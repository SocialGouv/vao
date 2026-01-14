/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("front")
    .alterTable("users", function (table) {
      table.timestamp("cgu_accepted_at").nullable();
      table.boolean("cgu_accepted").defaultTo(false);
    })
    .then(() => {
      return knex.schema
        .withSchema("back")
        .alterTable("users", function (table) {
          table.timestamp("cgu_accepted_at").nullable();
          table.boolean("cgu_accepted").defaultTo(false);
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
    .alterTable("users", function (table) {
      table.dropColumn("cgu_accepted_at");
      table.dropColumn("cgu_accepted");
    })
    .then(() => {
      return knex.schema
        .withSchema("back")
        .alterTable("users", function (table) {
          table.dropColumn("cgu_accepted_at");
          table.dropColumn("cgu_accepted");
        });
    });
};
