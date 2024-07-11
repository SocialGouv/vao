/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.raw(`
    ALTER TYPE sejour_status ADD VALUE 'ABANDONNEE';
    ALTER TYPE sejour_status ADD VALUE 'SEJOUR EN COURS';
    ALTER TYPE sejour_status ADD VALUE 'TERMINEE';
  `);
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function () {
    return knex.raw(`
    DELETE FROM pg_enum 
    WHERE enumtypid = (SELECT e.enumtypid FROM pg_type t  
      JOIN pg_enum e ON e.enumtypid = t.oid
      WHERE t.typtype = 'e'
      AND t.typname = 'sejour_status'
      AND e.enumlabel IN ('ABANDONNEE', 'SEJOUR EN COURS', 'TERMINEE'))
    AND enumsortorder = (SELECT e.enumsortorder FROM pg_type t  
      JOIN pg_enum e ON e.enumtypid = t.oid
      WHERE t.typtype = 'e'
      AND t.typname = 'sejour_status'
      AND e.enumlabel IN ('ABANDONNEE', 'SEJOUR EN COURS', 'TERMINEE'));
      `);
  }
  ;
  