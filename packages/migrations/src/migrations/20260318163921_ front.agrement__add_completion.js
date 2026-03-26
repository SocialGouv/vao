/**
 * Migration agrements
 * Ajout des informations lors de demande de complétion ou refus
 * PostgreSQL + Knex.js
 */

exports.up = async function (knex) {
  await knex.schema
    .withSchema("front")
    .alterTable("agrements", function (table) {
      table.text("commentaire_completude");
      table.text("commentaire_refus");
    });

  await knex.schema.raw(`
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'file_category') THEN
        ALTER TYPE front.file_category ADD VALUE 'AGR_AMODIFIER';
        ALTER TYPE front.file_category ADD VALUE 'AGR_REFUS';
      END IF;
    END $$;
  `);
};

exports.down = async function (knex) {
  await knex.schema
    .withSchema("front")
    .alterTable("agrements", function (table) {
      table.dropColumn("commentaire_completude");
      table.dropColumn("commentaire_refus");
    });
  await knex.schema.raw(`
    DO $$
    DECLARE
      enum_values TEXT;
    BEGIN
      SELECT string_agg(quote_literal(enumlabel), ', ')
      INTO enum_values
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE t.typname = 'file_category'
        AND n.nspname = 'front'
        AND enumlabel NOT IN ('AGR_AMODIFIER', 'AGR_REFUS');

      ALTER TYPE front.file_category RENAME TO file_category_old;

      EXECUTE format(
        'CREATE TYPE front.file_category AS ENUM (%s)',
        enum_values
      );

      ALTER TABLE front.agrement_files
      ALTER COLUMN category TYPE front.file_category
      USING category::text::front.file_category;

      DROP TYPE front.file_category_old;

    END $$;
`);
};
