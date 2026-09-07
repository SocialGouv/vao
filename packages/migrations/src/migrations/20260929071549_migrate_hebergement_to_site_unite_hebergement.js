/**
 * Migration des données de front.hebergement vers les nouvelles tables :
 *   - front.site (1 site par hebergement_id, basé sur la version current=true)
 *   - front.site_organisme (liaison organisme ↔ site)
 *   - front.unite_hebergement (1 par version hebergement,=current ou false)
 *   - front.unite_hebergement_to_type_pension (si type_pension_id non null)
 *
 * La table front.hebergement_to_prestations_hotelieres est conservée en l'état
 * (elle référence hebergement.id qui ne change pas).
 *
 * La colonne hebergement.site_id est renseignée pour chaque hébergement migré.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`
    DO $$
    DECLARE
      r RECORD;
      v_new_site_id   UUID;
      v_new_site_pk   INT4;
      v_new_uh_pk     INT4;
      v_accessible_id INT4;
      v_non_adapte_id INT4;
      v_count_sites   INT4 := 0;
      v_count_uh      INT4 := 0;
    BEGIN
      SELECT id INTO v_accessible_id
        FROM front.hebergement_accessibilite WHERE value = 'accessible';
      SELECT id INTO v_non_adapte_id
        FROM front.hebergement_accessibilite WHERE value = 'non_adapte';

      IF v_accessible_id IS NULL OR v_non_adapte_id IS NULL THEN
        RAISE EXCEPTION 'Table front.hebergement_accessibilite incomplète (accessible / non_adapte)';
      END IF;

      DROP INDEX IF EXISTS front.idx_unite_hebergement_hebergement_id;

      -- ════════════════════════════════════════════════════════════════
      -- PASS 1 : 1 site par hebergement_id (version current=true)
      -- ════════════════════════════════════════════════════════════════
      FOR r IN
        SELECT DISTINCT ON (h.hebergement_id) h.*
          FROM front.hebergement h
         WHERE h.current = true
           AND h.supprime = false
           AND h.site_id IS NULL
           AND h.organisme_id IS NOT NULL
         ORDER BY h.hebergement_id, h.id DESC
      LOOP
        v_count_sites := v_count_sites + 1;

        INSERT INTO front.site (
          site_id, current, adresse_id, nom_site_officiel,
          hebergement_type_id, descriptif,
          created_at, edited_at, created_by, edited_by
        )
        VALUES (
          gen_random_uuid(), true,
          r.adresse_id, r.nom, r.type_id, r.description_lieu_hebergement,
          r.created_at, r.edited_at, r.created_by, r.edited_by
        )
        RETURNING id, site_id INTO v_new_site_pk, v_new_site_id;

        INSERT INTO front.site_organisme (
          site_id, organisme_id, nom_site,
          resp_nom_prenom, resp_telephone, resp_email
        )
        VALUES (
          v_new_site_id, r.organisme_id, r.nom,
          r.nom_gestionnaire, r.telephone_1, r.email
        );

        UPDATE front.hebergement
           SET site_id = v_new_site_id
         WHERE hebergement_id = r.hebergement_id
           AND site_id IS NULL;
      END LOOP;

      RAISE NOTICE 'Pass 1 : % sites créés', v_count_sites;

      -- ════════════════════════════════════════════════════════════════
      -- PASS 2 : 1 unite_hebergement par record hebergement (toutes versions)
      -- ════════════════════════════════════════════════════════════════
      FOR r IN
        SELECT h.*
          FROM front.hebergement h
         WHERE h.supprime = false
           AND h.site_id IS NOT NULL
           AND h.organisme_id IS NOT NULL
         ORDER BY h.hebergement_id, h.current DESC, h.id
      LOOP
        v_count_uh := v_count_uh + 1;

        INSERT INTO front.unite_hebergement (
          id,
          site_id, organisme_id, statut_id,
          created_at, edited_at,
          hebergement_id, "current",
          created_by, edited_by,
          nombre_couchage_total, lits_superposes,
          accessibilite_pmr, accessibilite_precision,
          chambres_doubles, separation_homme_femme,
          reglementation_erp, couchage_individuel,
          rangement_individuel, amenagements_specifiques,
          amenagements_specifiques_precision,
          excursion_description, deplacement_proximite_description,
          file_reponse_exploitant_ou_proprietaire,
          file_dernier_arrete_autorisation_maire,
          file_derniere_attestation_securite,
          visite_locaux, visite_locaux_at,
          vehicules_adaptes
        )
        VALUES (
          r.id,
          r.site_id, r.organisme_id, r.statut_id,
          r.created_at, r.edited_at,
          r.hebergement_id, r.current,
          r.created_by, r.edited_by,
          r.nombre_max_personnes_couchage,
          CASE WHEN COALESCE(r.nombre_lits_superposes, 0) > 0
               THEN true ELSE false END,
          CASE
            WHEN r.accessibilite_id = v_accessible_id THEN true
            WHEN r.accessibilite_id = v_non_adapte_id THEN false
            ELSE NULL
          END,
          NULL,
          r.chambres_doubles, r.chambres_unisexes,
          r.reglementation_erp, r.couchage_individuel,
          r.rangement_individuel, r.amenagements_specifiques,
          r.amenagements_specifiques_precision,
          r.excursion_description,
          r.deplacement_proximite_description,
          r.file_reponse_exploitant_ou_proprietaire,
          r.file_dernier_arrete_autorisation_maire,
          r.file_derniere_attestation_securite,
          r.visite_locaux, r.visite_locaux_at,
          r.vehicules_adaptes
        )
        RETURNING id INTO v_new_uh_pk;

        IF r.type_pension_id IS NOT NULL THEN
          INSERT INTO front.unite_hebergement_to_type_pension (
            unite_hebergement_id, type_pension_id
          )
          VALUES (v_new_uh_pk, r.type_pension_id);
        END IF;
      END LOOP;

      RAISE NOTICE 'Pass 2 : % unités d''hébergement créées (toutes versions confondues)', v_count_uh;

      RAISE NOTICE '% hébergements ignorés (organisme_id NULL)',
        (SELECT count(*) FROM front.hebergement
         WHERE supprime = false AND site_id IS NULL AND organisme_id IS NULL);
    END $$;
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw(`
    UPDATE front.hebergement SET site_id = NULL WHERE site_id IS NOT NULL;
    DELETE FROM front.unite_hebergement_to_type_pension;
    DELETE FROM front.unite_hebergement;
    DELETE FROM front.site_organisme;
    DELETE FROM front.site;
  `);
};
