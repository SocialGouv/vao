/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("front")
    .alterTable("users", function (table) {
      table.timestamp("last_mail_inactivity_5m_at").nullable();
      table.timestamp("last_mail_inactivity_5m_reminder_at").nullable();
      table.timestamp("planned_deletion_at").nullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("front")
    .alterTable("users", function (table) {
      table.dropColumn("last_mail_inactivity_5m_at");
      table.dropColumn("last_mail_inactivity_5m_reminder_at");
      table.dropColumn("planned_deletion_at");
    });
};