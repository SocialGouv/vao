/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) =>
  knex.schema.withSchema("front").alterTable("users", (table) => {
    table.string("ter_code", 4).nullable();
    table.text("motif_refus").nullable();
    table.integer("traite_compte_front_use_id").nullable();
    table.integer("traite_compte_back_use_id").nullable();
    table.timestamp("treated_at").nullable();
  });

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) =>
  knex.schema.withSchema("front").alterTable("users", (table) => {
    table.dropColumn("ter_code");
    table.dropColumn("motif_refus");
    table.dropColumn("traite_compte_front_use_id");
    table.dropColumn("traite_compte_back_use_id");
    table.dropColumn("treated_at");
  });
