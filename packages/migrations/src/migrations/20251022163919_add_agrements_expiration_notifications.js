exports.up = function (knex) {
  return knex.schema
    .withSchema("front")
    .alterTable("agrements", function (table) {
      table.timestamp("last_mail_expiration_6m_at").nullable();
      table.timestamp("last_mail_expiration_120j_at").nullable();
    });
};

exports.down = function (knex) {
  return knex.schema
    .withSchema("front")
    .alterTable("agrements", function (table) {
      table.dropColumn("last_mail_expiration_6m_at");
      table.dropColumn("last_mail_expiration_120j_at");
    });
};
