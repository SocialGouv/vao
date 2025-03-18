/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => {
  knex.schema.renameTable("crons", "legacy_crons");
  knex.schema.createTable("crons", (table) => {
    table.increments("id").primary();
    table.string("cron_name").unique().notNullable();
    table.date("start_date").notNullable();
    table.date("end_date").notNullable();
    table.jsonb("report");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => {
  knex.schema.dropTable("crons");
  knex.schema.renameTable("legacy_crons", "crons");
};
