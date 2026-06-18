/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.raw(`
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sejour_status') THEN
        ALTER TYPE sejour_status ADD VALUE 'EN COURS 8J';
        ALTER TYPE sejour_status ADD VALUE 'A MODIFIER 8J';
        ALTER TYPE sejour_status ADD VALUE 'VALIDEE 8J';
        ALTER TYPE sejour_status ADD VALUE 'REFUSEE 8J';
      END IF;
    END $$;
  `);

  await knex.schema.raw(`
    DO $$
    DECLARE
      enum_values TEXT;
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sejour_status') THEN
        RETURN;
      END IF;

      SELECT string_agg(quote_literal(enumlabel), ', ' ORDER BY enumsortorder)
      INTO enum_values
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'sejour_status'
        AND enumlabel NOT IN ('VALIDEE', 'MAJ POST 8J');

      ALTER TYPE sejour_status RENAME TO sejour_status_old;

      EXECUTE format(
        'CREATE TYPE sejour_status AS ENUM (%s)',
        enum_values
      );

      ALTER TABLE front.demande_sejour
      ALTER COLUMN statut TYPE sejour_status
      USING statut::text::sejour_status;

      DROP TYPE sejour_status_old;
    END $$;
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.raw(`
    DO $$
    DECLARE
      enum_values TEXT;
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sejour_status') THEN
        RETURN;
      END IF;

      SELECT string_agg(quote_literal(enumlabel), ', ' ORDER BY enumsortorder)
      INTO enum_values
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'sejour_status'
        AND enumlabel NOT IN ('EN COURS 8J', 'A MODIFIER 8J', 'VALIDEE 8J', 'REFUSEE 8J');

      ALTER TYPE sejour_status RENAME TO sejour_status_old;

      EXECUTE format(
        'CREATE TYPE sejour_status AS ENUM (%s)',
        enum_values
      );

      ALTER TABLE front.demande_sejour
      ALTER COLUMN statut TYPE sejour_status
      USING statut::text::sejour_status;

      DROP TYPE sejour_status_old;
    END $$;
  `);

  await knex.schema.raw(`
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sejour_status') THEN
        ALTER TYPE sejour_status ADD VALUE 'VALIDEE';
        ALTER TYPE sejour_status ADD VALUE 'MAJ POST 8J';
      END IF;
    END $$;
  `);
};
