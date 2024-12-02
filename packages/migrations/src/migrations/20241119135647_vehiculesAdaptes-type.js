/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(
    `
ALTER TABLE FRONT.HEBERGEMENT
RENAME COLUMN VEHICULES_ADAPTES TO VEHICULES_ADAPTES_DEPRECATED;

ALTER TABLE FRONT.HEBERGEMENT
ADD COLUMN VEHICULES_ADAPTES BOOLEAN;

UPDATE FRONT.HEBERGEMENT
SET
  VEHICULES_ADAPTES = CASE
    WHEN VEHICULES_ADAPTES_DEPRECATED = 'true' THEN TRUE
    ELSE FALSE
  END;
    `,
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw(
    `
ALTER TABLE FRONT.HEBERGEMENT
DROP COLUMN VEHICULES_ADAPTES;

ALTER TABLE FRONT.HEBERGEMENT
RENAME COLUMN VEHICULES_ADAPTES_DEPRECATED TO VEHICULES_ADAPTES;
    `,
  );
};
