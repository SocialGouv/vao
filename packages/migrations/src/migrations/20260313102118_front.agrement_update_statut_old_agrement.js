/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`
    UPDATE front.agrements SET statut = 'VALIDE';
  `);
};

exports.down = function (knex) {
  return knex.raw(`
    UPDATE front.agrements SET statut = null;
  `);
};
