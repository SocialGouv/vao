const postgresUser = process.env.PG_VAO_USER ?? "vao_u";

/**
 * Prépare front.unite_hebergement afin que son id corresponde
 * temporairement à front.hebergement.id.
 *
 * Avant :
 *   unite_hebergement.id = SERIAL
 *
 * Après :
 *   unite_hebergement.id = INT4 sans séquence
 *   unite_hebergement.id -> hebergement.id (FK)
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`
    DO $$
    BEGIN

      -- ================================================================
      -- 1. Vérification : la table doit être vide
      --
      -- On ne veut pas modifier les IDs existants.
      -- ================================================================
      IF EXISTS (
        SELECT 1
          FROM front.unite_hebergement
        LIMIT 1
      ) THEN
        RAISE EXCEPTION
          'Migration impossible : front.unite_hebergement contient déjà des données';
      END IF;


      -- ================================================================
      -- 2. Supprimer le DEFAULT du SERIAL
      --
      -- La colonne reste un INT4.
      -- La PK existante n'est pas touchée.
      -- ================================================================
      ALTER TABLE front.unite_hebergement
        ALTER COLUMN id DROP DEFAULT;


      -- ================================================================
      -- 3. Supprimer la séquence créée par SERIAL
      --
      -- Elle n'est plus nécessaire puisque l'id sera fourni
      -- explicitement depuis front.hebergement.id.
      -- ================================================================
      DROP SEQUENCE IF EXISTS front.unite_hebergement_id_seq;


      -- ================================================================
      -- 4. Ajouter la FK temporaire
      --
      -- Pendant la migration :
      --
      --   hebergement.id = 123
      --          ↓
      --   unite_hebergement.id = 123
      --
      -- La PK existante est conservée car elle peut être référencée
      -- par unite_hebergement_to_type_pension.
      -- ================================================================
      ALTER TABLE front.unite_hebergement
        ADD CONSTRAINT fk_unite_hebergement_hebergement
        FOREIGN KEY (id)
        REFERENCES front.hebergement(id);

      -- ================================================================
      -- 5. Ajout des colonnes manquantes sur front.site_organisme
      -- ================================================================
      ALTER TABLE front.site_organisme ADD COLUMN      excursion_description   text NULL;
      ALTER TABLE front.site_organisme ADD COLUMN      deplacement_proximite_description text NULL;
      ALTER TABLE front.site_organisme ADD COLUMN      vehicules_adaptes        bool NULL;

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

      -- La table doit être vide pour revenir proprement
      -- au fonctionnement SERIAL.
      IF EXISTS (
        SELECT 1
          FROM front.unite_hebergement
        LIMIT 1
      ) THEN
        RAISE EXCEPTION
          'Rollback impossible : front.unite_hebergement contient des données';
      END IF;


      -- Supprimer la FK temporaire
      ALTER TABLE front.unite_hebergement
        DROP CONSTRAINT IF EXISTS fk_unite_hebergement_hebergement;


      -- Recréer la séquence
      CREATE SEQUENCE front.unite_hebergement_id_seq;


      -- Restaurer les droits du rôle applicatif
      GRANT ALL ON SEQUENCE front.unite_hebergement_id_seq TO ${postgresUser};


      -- Rattacher la séquence à la colonne
      ALTER SEQUENCE front.unite_hebergement_id_seq
        OWNED BY front.unite_hebergement.id;


      -- Restaurer le comportement SERIAL
      ALTER TABLE front.unite_hebergement
        ALTER COLUMN id SET DEFAULT
        nextval('front.unite_hebergement_id_seq');

      -- ================================================================
      -- 5. Rollback : Ajouter les colonnes manquantes sur front.site_organisme
      -- ================================================================
      ALTER TABLE front.site_organisme ADD COLUMN      excursion_description;
      ALTER TABLE front.site_organisme ADD COLUMN      deplacement_proximite_description;
      ALTER TABLE front.site_organisme ADD COLUMN      vehicules_adaptes;

    END $$;
  `);
};
