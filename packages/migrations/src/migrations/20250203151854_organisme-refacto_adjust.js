/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`

    --Protocole Sanitaire drop files column
    ALTER TABLE front.org_protocole_sanitaire DROP COLUMN files;

    -- Rattrapage des fichiers manquants.
    INSERT INTO front.org_protocole_sanitaire_files (protocole_sanitaire_id, files)
      SELECT 
          ops.id,
          (file->>'uuid')::UUID AS uuid
      FROM front.organismes o
      INNER JOIN front.org_protocole_sanitaire ops ON ops.organisme_id = o.id
      CROSS JOIN LATERAL jsonb_array_elements(protocole_sanitaire->'files') AS file
      WHERE protocole_sanitaire->'files' IS NOT NULL 
      AND (file->>'uuid')::uuid NOT IN (
              SELECT files 
              FROM front.org_protocole_sanitaire_files 
              WHERE files = (file->>'uuid')::uuid
          );
`);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw(`
    ALTER TABLE front.org_protocole_sanitaire ADD COLUMN files UUID;
`);
};
