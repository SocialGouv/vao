/**
  Ajout de champs pour la gestion du code 2FA par email
*/
exports.up = async function (knex) {
  await knex.schema.withSchema("back").table("users", (table) => {
    table.integer("otp_code", 6);
    table.timestamp("otp_code_expires_at");
  });
  // Delete unused auth_try column
  await knex.schema.withSchema("back").table("users", (table) => {
    table.dropColumn("auth_try");
  });
  await knex.schema.withSchema("front").table("users", (table) => {
    table.integer("otp_code", 6);
    table.timestamp("otp_code_expires_at");
  });
};

exports.down = async function (knex) {
  await knex.schema.withSchema("back").table("users", (table) => {
    table.dropColumn("otp_code");
    table.dropColumn("otp_code_expires_at");
  });
  await knex.schema.withSchema("back").table("users", (table) => {
    table.integer("auth_try").defaultTo(0);
  });
  await knex.schema.withSchema("front").table("users", (table) => {
    table.dropColumn("otp_code");
    table.dropColumn("otp_code_expires_at");
  });
};
