/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("front")
    .createTable("feature_flags", (table) => {
      table.string("name", 255).primary().notNullable();
      table.string("description", 500).notNullable();
      table.boolean("enabled").notNullable().defaultTo(false);
      table.timestamp("date_from", { useTz: true }).nullable();
      table.timestamp("date_to", { useTz: true }).nullable();
      table
        .timestamp("created_at", { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());
      table
        .timestamp("updated_at", { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());
    })
    .then(function () {
      return knex.raw(
        "GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE front.feature_flags TO vao_u",
      );
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("front").dropTableIfExists("feature_flags");
};
