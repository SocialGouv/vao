/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(
    `
    ALTER TABLE front.hebergement
    DROP COLUMN coordonnees;

    ALTER TABLE front.hebergement
    DROP COLUMN informations_locaux;

    ALTER TABLE front.hebergement
    DROP COLUMN informations_transport;
    `,
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw();
};
