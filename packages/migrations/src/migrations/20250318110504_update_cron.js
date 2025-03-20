/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async (knex) => {
  await knex.schema.withSchema("back").renameTable("crons", "legacy_crons");

  const exists = await knex.schema.withSchema("back").hasTable("crons");
  if (!exists) {
    await knex.schema.withSchema("back").createTable("crons", (table) => {
      table.increments("id").primary();
      table.string("cron_name").notNullable();
      table.date("start_date").notNullable();
      table.date("end_date").notNullable();
      table.jsonb("report");
    });
  }

  await knex.raw(
    "GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE back.crons TO vao_u",
  );
  await knex.raw("GRANT USAGE, SELECT ON SEQUENCE back.crons_id_seq TO vao_u");
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async (knex) => {
  await knex.schema.withSchema("back").dropTable("crons");
  await knex.schema.withSchema("back").renameTable("legacy_crons", "crons");
};
