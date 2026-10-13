/**
 * Consolide le schéma unite_hebergement pour le flux site pur :
 *
 *  1. Ajoute les colonnes manquantes à front.unite_hebergement :
 *       - nombre_chambre_total     (INTEGER)
 *       - complement_localisation  (TEXT)
 *
 *  2. Crée la table de liaison front.unite_hebergement_to_prestations_hotelieres,
 *     rattachant les prestations hôtelières directement à l'unité hébergement,
 *     et effectue la reprise de données depuis front.hebergement_to_prestations_hotelieres.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const postgresUser = process.env.PG_VAO_USER ?? "vao_u";

exports.up = function (knex) {
  return knex.raw(`
    ALTER TABLE front.unite_hebergement
      ADD COLUMN IF NOT EXISTS nombre_chambre_total INTEGER,
      ADD COLUMN IF NOT EXISTS complement_localisation TEXT;

    CREATE TABLE IF NOT EXISTS front.unite_hebergement_to_prestations_hotelieres
    (
      unite_hebergement_id INTEGER NOT NULL,
      prestation_id        INTEGER NOT NULL,
      CONSTRAINT pk_unite_hebergement_prestation
        PRIMARY KEY (unite_hebergement_id, prestation_id),
      CONSTRAINT fk_uhprest_unite_hebergement
        FOREIGN KEY (unite_hebergement_id)
        REFERENCES front.unite_hebergement (id)
        ON DELETE CASCADE,
      CONSTRAINT fk_uhprest_prestation
        FOREIGN KEY (prestation_id)
        REFERENCES front.hebergement_prestations_hotelieres (id)
        ON DELETE CASCADE
    );

    GRANT ALL ON TABLE front.unite_hebergement_to_prestations_hotelieres
      TO ${postgresUser};

    INSERT INTO front.unite_hebergement_to_prestations_hotelieres (SELECT hebergement_id, prestation_id FROM front.hebergement_to_prestations_hotelieres p);
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw(`

    DROP TABLE IF EXISTS front.unite_hebergement_to_prestations_hotelieres;

    ALTER TABLE front.unite_hebergement
      DROP COLUMN IF EXISTS complement_localisation,
      DROP COLUMN IF EXISTS nombre_chambre_total;
  `);
};
