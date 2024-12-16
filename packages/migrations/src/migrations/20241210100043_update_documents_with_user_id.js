/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.alterTable("doc.documents", (table) => {
    table
      .integer("user_id")
      .nullable()
      .references("id")
      .inTable("front.users")
      .onDelete("SET NULL");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.alterTable("doc.documents", (table) => {
    table.dropForeign(["user_id"]);
    table.dropColumn("user_id");
  });
};
