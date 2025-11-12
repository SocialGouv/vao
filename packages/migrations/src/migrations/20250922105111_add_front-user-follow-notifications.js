exports.up = (knex) =>
  knex.schema.withSchema("front").alterTable("users", (table) => {
    table.timestamp("last_mail_inactivity_2m_at").nullable();
  });

exports.down = (knex) =>
  knex.schema.withSchema("front").alterTable("users", (table) => {
    table.dropColumn("last_mail_inactivity_2m_at");
  });
