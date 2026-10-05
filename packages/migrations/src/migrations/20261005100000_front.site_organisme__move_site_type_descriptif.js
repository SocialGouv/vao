/**
 * Déplace hebergement_type_id et descriptif de front.site vers
 * front.site_organisme.
 *
 * Avant :
 *   front.site.hebergement_type_id  int4  (FK -> front.hebergement_type)
 *   front.site.descriptif           text
 *
 * Après :
 *   front.site_organisme.hebergement_type_id  int4  (FK -> front.hebergement_type)
 *   front.site_organisme.descriptif           text
 *
 * Les données existantes sont copiées depuis front.site (jointure sur
 * site_id) avant suppression des colonnes sources. La FK est transférée
 * sur la table cible.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`
    DO $$
    BEGIN
      -- ================================================================
      -- 1. Ajout des colonnes sur front.site_organisme
      -- ================================================================
      ALTER TABLE front.site_organisme
        ADD COLUMN IF NOT EXISTS hebergement_type_id int4 NULL;
      ALTER TABLE front.site_organisme
        ADD COLUMN IF NOT EXISTS descriptif text NULL;

      -- ================================================================
      -- 2. Copie des données depuis front.site (jointure sur site_id)
      -- ================================================================
      UPDATE front.site_organisme so
         SET hebergement_type_id = s.hebergement_type_id,
             descriptif         = s.descriptif
        FROM front.site s
       WHERE s.site_id = so.site_id;

      -- ================================================================
      -- 3. Transfert de la FK vers front.site_organisme
      -- ================================================================
      ALTER TABLE front.site_organisme
        ADD CONSTRAINT fk_site_organisme_hebergement_type
        FOREIGN KEY (hebergement_type_id)
        REFERENCES front.hebergement_type(id);

      -- ================================================================
      -- 4. Suppression des colonnes sources (et de leur FK) sur front.site
      -- ================================================================
      ALTER TABLE front.site
        DROP CONSTRAINT IF EXISTS fk_site_hebergement_type;
      ALTER TABLE front.site
        DROP COLUMN IF EXISTS hebergement_type_id;
      ALTER TABLE front.site
        DROP COLUMN IF EXISTS descriptif;
    END $$;
  `);
};

/**
 * Rollback : restaure les colonnes sur front.site depuis
 * front.site_organisme puis supprime les colonnes de la table cible.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw(`
    DO $$
    BEGIN
      -- Restauration des colonnes sur front.site
      ALTER TABLE front.site
        ADD COLUMN IF NOT EXISTS hebergement_type_id int4 NULL;
      ALTER TABLE front.site
        ADD COLUMN IF NOT EXISTS descriptif text NULL;

      -- Copie de retour depuis front.site_organisme
      UPDATE front.site s
         SET hebergement_type_id = so.hebergement_type_id,
             descriptif         = so.descriptif
        FROM front.site_organisme so
       WHERE so.site_id = s.site_id;

      -- Restauration de la FK sur front.site
      ALTER TABLE front.site
        ADD CONSTRAINT fk_site_hebergement_type
        FOREIGN KEY (hebergement_type_id)
        REFERENCES front.hebergement_type(id);

      -- Suppression des colonnes / FK sur front.site_organisme
      ALTER TABLE front.site_organisme
        DROP CONSTRAINT IF EXISTS fk_site_organisme_hebergement_type;
      ALTER TABLE front.site_organisme
        DROP COLUMN IF EXISTS hebergement_type_id;
      ALTER TABLE front.site_organisme
        DROP COLUMN IF EXISTS descriptif;
    END $$;
  `);
};
