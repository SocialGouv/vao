/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`
    update geo.territoires t set parent_code ='CVDL' where parent_code ='CDVL';
`);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw(`
    update geo.territoires t set parent_code ='CDVL' where code = '28';
`);
};
