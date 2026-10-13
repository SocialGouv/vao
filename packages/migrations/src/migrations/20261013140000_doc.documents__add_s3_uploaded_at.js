/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.withSchema("doc").alterTable("documents", (table) => {
    table.timestamp("s3_uploaded_at").nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.withSchema("doc").alterTable("documents", (table) => {
    table.dropColumn("s3_uploaded_at");
  });
};
