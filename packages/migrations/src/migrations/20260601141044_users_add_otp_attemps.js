/**
  Ajout de champs pour la gestion des tentatives de code OTP par email
*/
exports.up = async function (knex) {
  await knex.schema.withSchema("back").table("users", (table) => {
    table.integer("otp_attempts").defaultTo(0);
    table.timestamp("otp_attempts_at");
  });
  await knex.schema.withSchema("front").table("users", (table) => {
    table.integer("otp_attempts").defaultTo(0);
    table.timestamp("otp_attempts_at");
  });
};

exports.down = async function (knex) {
  await knex.schema.withSchema("back").table("users", (table) => {
    table.dropColumn("otp_attempts");
    table.dropColumn("otp_attempts_at");
  });
  await knex.schema.withSchema("front").table("users", (table) => {
    table.dropColumn("otp_attempts");
    table.dropColumn("otp_attempts_at");
  });
};
