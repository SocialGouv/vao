/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema
    .withSchema("front")
    .createTable("agrement_messagerie", function (table) {
      table.increments("id").primary();
      table
        .integer("agrement_id")
        .notNullable()
        .references("id")
        .inTable("front.agrements");
      table.integer("front_user_id").nullable();
      table.integer("back_user_id").nullable();
      table.string("message", 1000).notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
      table.timestamp("read_at").nullable();
    });

  await knex.raw(`GRANT ALL ON TABLE front.agrement_messagerie TO vao_u;`);
  await knex.raw(
    `GRANT ALL ON SEQUENCE front.agrement_messagerie_id_seq TO vao_u;`,
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("front")
    .dropTableIfExists("agrement_messagerie");
};
