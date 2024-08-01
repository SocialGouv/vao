/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`
    ALTER TABLE front.demande_sejour_message add read_at TIMESTAMP;
    UPDATE front.demande_sejour_message SET read_at= current_timestamp;
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw(`
    ALTER TABLE front.demande_sejour_message drop column read_at;
  `);
};
