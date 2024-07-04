/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.withSchema('doc').alterTable('documents', function (table) {
    table.setNullable('file');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema('doc').alterTable('documents', function (table) {
    table.dropNullable('file');
  });
};
