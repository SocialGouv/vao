/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.raw(`
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'file_category') THEN
        ALTER TYPE front.file_category ADD VALUE 'AGR_BILANQUALITPERCEPTION';
        ALTER TYPE front.file_category ADD VALUE 'AGR_BILANQUALITPERSPECTIVE'; 
        ALTER TYPE front.file_category ADD VALUE 'AGR_BILANQUALITELEMENTSMARQUANTS';
        ALTER TYPE front.file_category ADD VALUE 'AGR_BILANQUALITCOMPLEMENTAIRES';
        ALTER TYPE front.file_category ADD VALUE 'AGR_BILANFINANCIERQUATREANNEES';
      END IF;
    END $$;
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function () {};
