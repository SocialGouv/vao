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
        ALTER TYPE front.file_category ADD VALUE 'AGR_BILANQUALITELEMARQ';
        ALTER TYPE front.file_category ADD VALUE 'AGR_BILANQUALITCOMPLEMENTAIRES';
        ALTER TYPE front.file_category ADD VALUE 'AGR_BILANFINANCIERQUATREANNEES';
        ALTER TYPE front.file_category ADD VALUE 'AGR_PROJETSSEJOURSPREVUS';
        ALTER TYPE front.file_category ADD VALUE 'AGR_PROJSEJCOMPETEXP';
        ALTER TYPE front.file_category ADD VALUE 'AGR_PROJETSSEJOURSMESURES';
        ALTER TYPE front.file_category ADD VALUE 'AGR_PROJETSSEJOURSCOMPLEMENTAIRES';
        ALTER TYPE front.file_category ADD VALUE 'AGR_PROJETSSEJOURSCASIER';
        ALTER TYPE front.file_category ADD VALUE 'AGR_PROJSSEJORGATRANSPORT';
        ALTER TYPE front.file_category ADD VALUE 'AGR_PROJETSSEJOURSSUIVIMED';
        ALTER TYPE front.file_category ADD VALUE 'AGR_PROJSEJPROTCOREORIENT';
        ALTER TYPE front.file_category ADD VALUE 'AGR_PROJSSEJOURSPROTCOLERAPATR';
        ALTER TYPE front.file_category ADD VALUE 'AGR_PROJSEJOURSBUDGETPERSONNES';
      END IF;
    END $$;
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function () {};
