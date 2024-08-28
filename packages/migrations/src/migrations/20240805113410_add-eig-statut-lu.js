/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`
INSERT INTO
  FRONT.EIG_STATUT (STATUT)
VALUES
  ('LU')
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw(`
DELETE FROM FRONT.EIG_STATUT
WHERE
  STATUT = 'LU'
  `);
};
