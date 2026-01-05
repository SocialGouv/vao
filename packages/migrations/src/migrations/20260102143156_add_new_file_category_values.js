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
        ALTER TYPE front.file_category ADD VALUE 'AGR_PROJETSSEJOURSPREVUS';
        ALTER TYPE front.file_category ADD VALUE 'AGR_PROJETSSEJOURSCOMPETENCESEXPERIENCE';
        ALTER TYPE front.file_category ADD VALUE 'AGR_PROJETSSEJOURSMESURES';
        ALTER TYPE front.file_category ADD VALUE 'AGR_PROJETSSEJOURSCOMPLEMENTAIRES';
        ALTER TYPE front.file_category ADD VALUE 'AGR_PROJETSSEJOURSCASIER';
        ALTER TYPE front.file_category ADD VALUE 'AGR_PROJETSSEJOURSORGATRANSPORT';
        ALTER TYPE front.file_category ADD VALUE 'AGR_PROJETSSEJOURSSUIVIMED';
        ALTER TYPE front.file_category ADD VALUE 'AGR_PROJETSSEJOURSPROTCOLEREORIENTATION';
        ALTER TYPE front.file_category ADD VALUE 'AGR_PROJETSSEJOURSPROTCOLERAPATRIEMENT';
        ALTER TYPE front.file_category ADD VALUE 'AGR_PROJETSSEJOURSBUDGETPERSONNES';
      END IF;
    END $$;
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function () {};
