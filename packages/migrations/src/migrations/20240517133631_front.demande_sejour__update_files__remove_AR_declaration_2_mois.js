/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`
UPDATE front.demande_sejour
SET files = jsonb_set(
    files,
    '{files}',
    (
    SELECT jsonb_agg(elem)
    FROM jsonb_array_elements(files->'files') AS elem
    WHERE elem->>'type' IS DISTINCT FROM 'AR_declaration_2_mois'
    )
)
WHERE files->'files' IS NOT NULL
AND edited_at < '2024-05-17T16:00:00';
`);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function () {};
