/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("front")
    .createTable("api_keys", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table
        .integer("user_id")
        .notNullable()
        .unique()
        .references("id")
        .inTable("front.users")
        .onDelete("CASCADE");
      table.string("api_token", 1024).notNullable().unique();
      table.timestamp("expires_at", { useTz: true }).notNullable();
      table
        .timestamp("created_at", { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());
    })
    .then(function () {
      return knex.raw(
        "GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE front.api_keys TO vao_u",
      );
    });
};

exports.down = function (knex) {
  return knex.schema.withSchema("front").dropTableIfExists("api_keys");
};
