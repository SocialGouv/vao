/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.up = function (knex) {
  return knex
    .withSchema("back")
    .table("roles")
    .insert({
      id: 6,
      label: "Desactivation",
    })
    .then(function () {
      return knex.schema
        .withSchema("back")
        .table("users", function (table) {
          table.integer("deleted_use_id");
          table.datetime("deleted_date");
        });
    })
    .then(function () {
      return knex.raw("INSERT INTO back.user_roles SELECT id,6 FROM back.users where ter_code = 'FRA'")
    })
    .then(function () {
      return knex.raw("UPDATE back.users SET deleted = false")
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
/*
DELETE FROM back.user_roles WHERE rol_id= 6
DELETE FROM back.roles WHERE id= 6
alter table back.users drop column deleted_use_id;
alter table back.users drop column deleted_date;
delete from public.knex_migrations where name ='20240711144251_back.roles__insert_desactivation.js'
UPDATE back.users SET deleted = false
*/
exports.down = function (knex) {
  return knex
    .withSchema("back")
    .table("roles")
    .where({
      label: "Desactivation",
    })
    .delete()
    .then(function () {
      return knex.schema
        .withSchema("back")
        .table("users", function (table) {
          dropColumn("deleted_use_id");
          dropColumn("deleted_date");
        });
    })    
    .then(function () {
      return knex.raw("DELETE FROM back.user_roles WHERE rol_id= 6")
    })
};
