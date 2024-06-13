/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`
  ALTER TYPE sejour_status ADD VALUE 'EN COURS 8J';
  ALTER TYPE sejour_status ADD VALUE 'A MODIFIER 8J';
  ALTER TYPE sejour_status ADD VALUE 'VALIDEE 8J';
  ALTER TYPE sejour_status ADD VALUE 'REFUSEE 8J';

  DELETE FROM pg_enum 
    WHERE enumtypid = (SELECT e.enumtypid FROM pg_type t  
      JOIN pg_enum e ON e.enumtypid = t.oid
      WHERE t.typtype = 'e'
      AND t.typname = 'sejour_status'
      AND e.enumlabel = 'VALIDEE')
    AND enumsortorder = (SELECT e.enumsortorder FROM pg_type t  
      JOIN pg_enum e ON e.enumtypid = t.oid
      WHERE t.typtype = 'e'
      AND t.typname = 'sejour_status'
      AND e.enumlabel = 'VALIDEE');
            
  DELETE FROM pg_enum
    WHERE enumtypid = (SELECT e.enumtypid FROM pg_type t  
      JOIN pg_enum e ON e.enumtypid = t.oid
      WHERE t.typtype = 'e'
      AND t.typname = 'sejour_status'
      AND e.enumlabel = 'MAJ POST 8J')
    AND enumsortorder = (SELECT e.enumsortorder FROM pg_type t  
      JOIN pg_enum e ON e.enumtypid = t.oid
      WHERE t.typtype = 'e'
      AND t.typname = 'sejour_status'
      AND e.enumlabel = 'MAJ POST 8J');
`);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function () {};
