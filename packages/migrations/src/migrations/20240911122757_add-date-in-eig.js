/**
 * @param { import("knex").Knex } knex
 * @returns {Knex.Raw<TResult>}
 */
exports.up = function (knex) {
  return knex.raw(
    `
ALTER TABLE FRONT.EIG
ADD COLUMN date DATE;
UPDATE FRONT.EIG eig SET date = (select date_debut from front.demande_sejour where id = eig.demande_sejour_id);
ALTER TABLE FRONT.EIG
ALTER COLUMN date SET NOT NULL;
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
DROP COLUMN date;
  `);
};
