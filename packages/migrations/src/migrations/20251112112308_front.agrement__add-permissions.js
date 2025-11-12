/**
 * Ajout des droits sur les nouvelles tables "agréments"
 */
const tables = [
  "activite",
  "agrement_files",
  "agrement_animation",
  "agrement_sejours",
  "agrement_bilan_annuel",
  "bilan_hebergement",
];
exports.up = async function (knex) {
  // --- GRANT ALL PRIVILEGES ---

  for (const table of tables) {
    await knex.schema.raw(`
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_class c
                 JOIN pg_namespace n ON n.oid = c.relnamespace
                 WHERE c.relname = '${table}'
                   AND n.nspname = 'front') THEN
        EXECUTE 'GRANT ALL ON TABLE front.${table} TO vao_u;';
      END IF;
    END $$;
  `);

    await knex.schema.raw(`
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_class c
                 JOIN pg_namespace n ON n.oid = c.relnamespace
                 WHERE c.relname = '${table}_id_seq'
                   AND n.nspname = 'front') THEN
        EXECUTE 'GRANT ALL ON SEQUENCE front.${table}_id_seq TO vao_u;';
      END IF;
    END $$;
  `);
  }
};

exports.down = async function (knex) {
  // --- REVOKE ALL PRIVILEGES ---
  for (const table of tables) {
    await knex.schema.raw(`
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_class c
                 JOIN pg_namespace n ON n.oid = c.relnamespace
                 WHERE c.relname = '${table}'
                   AND n.nspname = 'front') THEN
        EXECUTE 'REVOKE ALL ON TABLE front.${table} FROM vao_u;';
      END IF;
    END $$;
  `);

    await knex.schema.raw(`
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_class c
                 JOIN pg_namespace n ON n.oid = c.relnamespace
                 WHERE c.relname = '${table}_id_seq'
                   AND n.nspname = 'front') THEN
        EXECUTE 'REVOKE ALL ON SEQUENCE front.${table}_id_seq FROM vao_u;';
      END IF;
    END $$;
  `);
  }
};
