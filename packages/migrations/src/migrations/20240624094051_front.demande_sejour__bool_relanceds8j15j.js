/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

/*
ALTER TABLE demande_sejour ADD COLUMN rappel_ds_compl DEFAULT false;

CREATE TABLE back.crons (
   cro_name VARCHAR(60) PRIMARY KEY,
   cro_duration INT,
   cro_error VARCHAR(500),
   cro_message VARCHAR(500)

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE back.crons TO vao_u
);
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("front")
    .alterTable("demande_sejour", function (table) {
      table.boolean("rappel_ds_compl").notNullable().defaultTo(false);
    })
    .then(function () {
      return knex.schema
        .withSchema("back")
        .createTable("crons", function (table) {
          table.string("cro_name", 60);
          table.integer("cro_duration");
          table.string("cro_error", 500);
          table.string("cro_message", 500);
        });
    })
    .then(function () {
      return knex.raw(
        "GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE back.crons TO vao_u",
      );
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.down = function (knex) {
  return knex.schema
    .withSchema("back")
    .dropTable("crons")
    .then(function () {
      return knex.schema
        .withSchema("front")
        .alterTable("demande_sejour", function (table) {
          table.dropColumn("rappel_ds_compl");
        });
    });
};
