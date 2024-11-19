/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`
    ALTER TABLE FRONT.demande_sejour
    ADD COLUMN sejour_etranger BOOLEAN,
    ADD COLUMN sejour_itinerant BOOLEAN;

    UPDATE FRONT.DEMANDE_SEJOUR
    SET
    SEJOUR_ETRANGER = (HEBERGEMENT -> 'sejourEtranger')::BOOLEAN,
    SEJOUR_ITINERANT = (HEBERGEMENT -> 'sejourItinerant')::BOOLEAN ;
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw(`
ALTER TABLE FRONT.DEMANDE_SEJOUR
DROP COLUMN SEJOUR_ETRANGER,
DROP COLUMN SEJOUR_ITINERANT;
  `);
};
