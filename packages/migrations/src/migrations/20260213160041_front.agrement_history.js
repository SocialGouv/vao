/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema
    .withSchema("front")
    .createTable("agrement_history", function (table) {
      table.increments("id").primary();
      table.string("source", 80).notNullable();
      table
        .integer("agrement_id")
        .notNullable()
        .references("id")
        .inTable("front.agrements");
      table.integer("usager_user_id").references("id").inTable("front.users");
      table.integer("bo_user_id").references("id").inTable("back.users");
      table.string("type", 80);
      table.string("type_precision", 80);
      table.jsonb("metadata");
      table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    });

  await knex.raw(`GRANT ALL ON TABLE front.agrement_history TO vao_u;`);
  await knex.raw(
    `GRANT ALL ON SEQUENCE front.agrement_history_id_seq TO vao_u;`,
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("front").dropTableIfExists("agrement_history");
};
