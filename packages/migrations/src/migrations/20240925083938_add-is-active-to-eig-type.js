/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(
    `
ALTER TABLE FRONT.EIG_TYPE
ADD COLUMN IS_ACTIVE BOOLEAN DEFAULT TRUE ;

UPDATE FRONT.EIG_TYPE
SET IS_ACTIVE = FALSE
WHERE TYPE = 'VIOLS' ;
`,
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw(`
ALTER TABLE FRONT.EIG_TYPE
DROP COLUMN IS_ACTIVE ;
  `);
};
