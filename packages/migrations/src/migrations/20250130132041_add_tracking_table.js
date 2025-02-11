/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) =>
  knex.schema
    .withSchema("public")
    .createTable("tracking_actions", (table) => {
      table.increments("id").primary();
      table.string("entity").notNullable();
      table.text("entity_id").notNullable();
      table.string("action", 50).notNullable();
      table.jsonb("data");
      table.integer("user_id").notNullable();
      table.string("user_type", 50).notNullable();
      table.timestamp("timestamp", { useTz: true }).defaultTo(knex.fn.now());
    })
    .then(function () {
      return knex.raw(
        "GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.tracking_actions TO vao_u",
      );
    })
    .then(function () {
      return knex.raw(
        "GRANT USAGE, SELECT ON SEQUENCE public.tracking_actions_id_seq TO vao_u",
      );
    });

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) =>
  knex.schema.withSchema("public").dropTableIfExists("tracking_actions");
