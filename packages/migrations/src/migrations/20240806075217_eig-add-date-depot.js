/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.raw(
    `
ALTER TABLE FRONT.EIG
ADD COLUMN DATE_DEPOT TIMESTAMP;
UPDATE FRONT.EIG SET DATE_DEPOT = NOW();
    `,
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.raw(`
ALTER TABLE FRONT.EIG
DROP COLUMN DATE_DEPOT;
  `);
};
