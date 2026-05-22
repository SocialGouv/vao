/**
 * Migration agrements - refactor statuts
 */

exports.config = { transaction: false };

exports.up = async function (knex) {
  // 1. On passe l'Enum en format texte
  await knex.schema.raw(`
    ALTER TABLE front.agrements
    ALTER COLUMN statut TYPE text
    USING statut::text;
  `);

  // 2. On lance les updates pour les nouveaux statuts
  await knex.schema.raw(`
    UPDATE front.agrements
    SET statut = 'PRIS_EN_CHARGE'
    WHERE statut = 'EN_COURS';
  `);

  await knex.schema.raw(`
    UPDATE front.agrements
    SET statut = 'A_COMPLETER'
    WHERE statut = 'A_MODIFIER';
  `);

  await knex.schema.raw(`
    UPDATE front.agrements
    SET statut = 'EN_INSTRUCTION'
    WHERE statut = 'COMPLETUDE_CONFIRME';
  `);

  // 3. drop default si existant
  await knex.schema.raw(`
    ALTER TABLE front.agrements
    ALTER COLUMN statut DROP DEFAULT;
  `);

  // 4. On drop l'enum plus utilisé
  await knex.schema.raw(`
    DROP TYPE IF EXISTS front.agrement_statut;
  `);

  // 5. recreate enum propre
  await knex.schema.raw(`
    CREATE TYPE front.agrement_statut AS ENUM (
      'BROUILLON',
      'TRANSMIS',
      'PRIS_EN_CHARGE',
      'EN_INSTRUCTION',
      'A_COMPLETER',
      'REFUSE',
      'COMPLETUDE_CONFIRME',
      'VALIDE',
      'A_CORRIGER'
    );
  `);

  // 6. alter de la colonne vers enum
  await knex.schema.raw(`
    ALTER TABLE front.agrements
    ALTER COLUMN statut TYPE front.agrement_statut
    USING statut::front.agrement_statut;
  `);

  // 7. default final
  await knex.schema.raw(`
    ALTER TABLE front.agrements
    ALTER COLUMN statut SET DEFAULT 'BROUILLON';
  `);
};
exports.config = { transaction: false };

exports.down = async function (knex) {
  // 1. alter en text pour éviter les problèmes de rollback (ajout de valeurs dans l'enum)
  await knex.schema.raw(`
    ALTER TABLE front.agrements
    ALTER COLUMN statut TYPE text
    USING statut::text;
  `);

  // 2. rollback des valeurs
  await knex.schema.raw(`
    UPDATE front.agrements
    SET statut = 'EN_COURS'
    WHERE statut = 'PRIS_EN_CHARGE';
  `);

  await knex.schema.raw(`
    UPDATE front.agrements
    SET statut = 'A_MODIFIER'
    WHERE statut = 'A_COMPLETER';
  `);

  await knex.schema.raw(`
    UPDATE front.agrements
    SET statut = 'COMPLETUDE_CONFIRME'
    WHERE statut = 'EN_INSTRUCTION';
  `);

  // 3. drop de l'enum modifié
  await knex.schema.raw(`
    DROP TYPE IF EXISTS front.agrement_statut;
  `);

  // 4. recreate de l'enum d'origine
  await knex.schema.raw(`
    CREATE TYPE front.agrement_statut AS ENUM (
      'BROUILLON',
      'TRANSMIS',
      'DEPOSE',
      'VERIF_EN_COURS',
      'EN_COURS',
      'A_MODIFIER',
      'REFUSE',
      'COMPLETUDE_CONFIRME',
      'VALIDE',
      'A_CORRIGER'
    );
  `);

  // 5. alter de la colonne vers enum
  await knex.schema.raw(`
    ALTER TABLE front.agrements
    ALTER COLUMN statut TYPE front.agrement_statut
    USING statut::front.agrement_statut;
  `);

  // 6. default final
  await knex.schema.raw(`
    ALTER TABLE front.agrements
    ALTER COLUMN statut SET DEFAULT 'BROUILLON';
  `);
};
