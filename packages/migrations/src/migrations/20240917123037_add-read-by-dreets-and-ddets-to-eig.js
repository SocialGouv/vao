/**
 * @param { import("knex").Knex } knex
 * @returns {Knex.Raw<TResult>}
 */
exports.up = function (knex) {
  return knex.raw(
    `
ALTER TABLE FRONT.EIG
ADD COLUMN READ_BY_DREETS BOOLEAN DEFAULT FALSE,
ADD COLUMN READ_BY_DDETS BOOLEAN DEFAULT FALSE;

UPDATE FRONT.EIG
SET
  READ_BY_DREETS = TRUE,
  READ_BY_DDETS = TRUE
WHERE
  STATUT_ID = (
    SELECT
      ID
    FROM
      FRONT.EIG_STATUT
    WHERE
      STATUT = 'LU'
);
    `,
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns {Knex.Raw<TResult>}
 */
exports.down = function (knex) {
  return knex.raw(`
ALTER TABLE FRONT.EIG
DROP COLUMN READ_BY_DREETS,
DROP COLUMN READ_BY_DEETS;
  `);
};
