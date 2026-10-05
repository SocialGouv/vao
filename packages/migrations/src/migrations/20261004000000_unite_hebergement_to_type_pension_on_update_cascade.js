/**
 * Passe la FK unite_hebergement_to_type_pension.unite_hebergement_id
 * en ON UPDATE CASCADE.
 *
 * Pourquoi : la désactivation / la mise à jour d'un hébergement versionne
 * front.hebergement (nouvel id) puis resynchronise l'unité courante en
 * ré-affectant unite_hebergement.id (contrainte fk_unite_hebergement_hebergement :
 * unite_hebergement.id REFERENCES front.hebergement(id)). Or les lignes
 * unite_hebergement_to_type_pension référencent cet id via une FK en
 * ON DELETE CASCADE sans ON UPDATE CASCADE : le re-key de l'unité échouait
 * en foreign_key_violation (500 UnexpectedError) dès qu'une pension existait.
 * Avec ON UPDATE CASCADE, les allocations de pension suivent l'unité lors du
 * re-key, comme le fait déjà setUniteHebergementTypePensions en purge/réinsertion.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`
    ALTER TABLE front.unite_hebergement_to_type_pension
      DROP CONSTRAINT IF EXISTS fk_uhtp_unite_hebergement;

    ALTER TABLE front.unite_hebergement_to_type_pension
      ADD CONSTRAINT fk_uhtp_unite_hebergement
      FOREIGN KEY (unite_hebergement_id)
      REFERENCES front.unite_hebergement(id)
      ON DELETE CASCADE
      ON UPDATE CASCADE;
  `);
};

/**
 * Restaure le comportement d'origine (ON DELETE CASCADE sans ON UPDATE CASCADE).
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw(`
    ALTER TABLE front.unite_hebergement_to_type_pension
      DROP CONSTRAINT IF EXISTS fk_uhtp_unite_hebergement;

    ALTER TABLE front.unite_hebergement_to_type_pension
      ADD CONSTRAINT fk_uhtp_unite_hebergement
      FOREIGN KEY (unite_hebergement_id)
      REFERENCES front.unite_hebergement(id)
      ON DELETE CASCADE;
  `);
};
