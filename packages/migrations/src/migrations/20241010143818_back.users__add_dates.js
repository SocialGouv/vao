/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.up = function (knex) {
  return knex.schema
    .withSchema("back")
    .table("users", function (table) {
      table.datetime("validated_at");
      table.datetime("lastconnection_at");
    })
    .then(function () {
      return knex.raw(
        "UPDATE back.users SET lastconnection_at = created_at,  validated_at = created_at",
      );
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
/*
alter table back.users drop column validated_at;
alter table back.users drop column lastconnection_at;
*/
exports.down = function (knex) {
  return knex.schema.withSchema("back").table("users", function (table) {
    table.dropColumn("validated_at");
    table.dropColumn("lastconnection_at");
  });
};
