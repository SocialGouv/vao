const postgresUser = process.env.PG_VAO_USER ?? "vao_u";

/**
 * Rétablit une auto-incrémentation autonome sur front.unite_hebergement.id
 * pour le flux site pur (création d'une unité sans hébergement legacy).
 *
 * Avant :
 *   unite_hebergement.id = INT4 sans séquence
 *   unite_hebergement.id -> hebergement.id (FK temporaire)
 *
 * Après :
 *   unite_hebergement.id = INT4 SERIAL (séquence autonome)
 *   FK temporaire retirée
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`
    DO $$
    BEGIN
      -- ================================================================
      -- 1. Retirer la FK temporaire vers front.hebergement.id
      -- ================================================================
      ALTER TABLE front.unite_hebergement
        DROP CONSTRAINT IF EXISTS fk_unite_hebergement_hebergement;

      -- ================================================================
      -- 2. Recréer la séquence
      -- ================================================================
      CREATE SEQUENCE IF NOT EXISTS front.unite_hebergement_id_seq;

      -- ================================================================
      -- 3. Restaurer les droits du rôle applicatif
      -- ================================================================
      GRANT ALL ON SEQUENCE front.unite_hebergement_id_seq TO ${postgresUser};

      -- ================================================================
      -- 4. Rattacher la séquence à la colonne
      -- ================================================================
      ALTER SEQUENCE front.unite_hebergement_id_seq
        OWNED BY front.unite_hebergement.id;

      -- ================================================================
      -- 5. Restaurer le comportement SERIAL
      -- ================================================================
      ALTER TABLE front.unite_hebergement
        ALTER COLUMN id SET DEFAULT
        nextval('front.unite_hebergement_id_seq');

      -- ================================================================
      -- 6. Synchroniser la séquence avec les IDs existants
      --    (évite les conflits de clé primaire avec les données migrées)
      -- ================================================================
      IF EXISTS (SELECT 1 FROM front.unite_hebergement) THEN
        PERFORM setval(
          'front.unite_hebergement_id_seq',
          (SELECT GREATEST(MAX(id), 1) FROM front.unite_hebergement)
        );
      END IF;
    END $$;
  `);
};

/**
 * Rollback
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw(`
    DO $$
    BEGIN
      -- La table doit être vide pour revenir proprement au mode
      -- miroir (id = hebergement.id).
      IF EXISTS (
        SELECT 1
          FROM front.unite_hebergement
        LIMIT 1
      ) THEN
        RAISE EXCEPTION
          'Rollback impossible : des unités d''hébergement existent. '
          'Intervention manuelle requise.';
      END IF;

      -- Supprimer le DEFAULT du SERIAL
      ALTER TABLE front.unite_hebergement
        ALTER COLUMN id DROP DEFAULT;

      -- Supprimer la séquence
      DROP SEQUENCE IF EXISTS front.unite_hebergement_id_seq;

      -- Restaurer la FK temporaire vers front.hebergement.id
      ALTER TABLE front.unite_hebergement
        ADD CONSTRAINT fk_unite_hebergement_hebergement
        FOREIGN KEY (id)
        REFERENCES front.hebergement(id);
    END $$;
  `);
};
