/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(
    `
ALTER TABLE FRONT.EIG
ADD COLUMN EMAIL_AUTRES_DESTINATAIRES VARCHAR(320) [] DEFAULT ARRAY[]::VARCHAR(320) [];
    `,
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw(`
ALTER TABLE FRONT.EIG
DROP COLUMN EMAIL_AUTRES_DESTINATAIRES;
  `);
};
