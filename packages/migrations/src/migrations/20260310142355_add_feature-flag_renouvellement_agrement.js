/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`
    INSERT INTO public.feature_flags ("name", description, enabled, date_from, date_to, created_at, updated_at) VALUES('RENOUVELLEMENT_AGREMENT', 'Renouvellement d''agrément', false, null, null, now(), now());
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw(`
    DELETE FROM public.feature_flags WHERE name = 'RENOUVELLEMENT_AGREMENT';
  `);
};
