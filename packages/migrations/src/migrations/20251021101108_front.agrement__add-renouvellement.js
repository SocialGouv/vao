/**
 * Migration complète du modèle des "agréments"
 * PostgreSQL + Knex.js
 */

exports.up = async function (knex) {
  // --- ENUMS ---
  await knex.schema.raw(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activite_type') THEN
        CREATE TYPE front.activite_type AS ENUM ('SPORT', 'CULTURE');
      END IF;
    END $$;
  `);

  await knex.schema.raw(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'file_category') THEN
        CREATE TYPE front.file_category AS ENUM (
          'AGR_PROCVERBAL',
          'AGR_MOTIVATION',
          'AGR_IMMATRICUL',
          'AGR_ASSURRESP',
          'AGR_ASSURRAPAT',
          'AGR_SEJOUR',
          'AGR_ACCOMPRESP',
          'AGR_SUIVIMED',
          'AGR_BUDGET',
          'AGR_CHANGEEVOL',
          'AGR_BILANQUALIT',
          'AGR_BILANFINANC'
        );
      END IF;
    END $$;
  `);

  await knex.schema.raw(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'agrement_statut') THEN
        CREATE TYPE front.agrement_statut AS ENUM (
          'BROUILLON',
          'TRANSMIS',
          'DEPOSE',
          'VERIF_EN_COURS',
          'PRIS_EN_CHARGE',
          'EN_COURS',
          'A_MODIFIER',
          'REFUSE',
          'COMPLETUDE_CONFIRME',
          'VALIDE'
        );
      END IF;
    END $$;
  `);

  // --- ALTER TABLE agrements ---
  await knex.schema
    .withSchema("front")
    .alterTable("agrements", function (table) {
      table
        .enu("statut", [], {
          enumName: "agrement_statut",
          existingType: true,
          useNative: true,
        })
        .notNullable()
        .defaultTo("BROUILLON");
      table.timestamp("update_at");
      table.date("date_obtention_certificat");
      table.date("date_depot");
      table.date("date_verif_completure");
      table.date("date_confirm_completude");
      table.text("commentaire");
      table.text("motivations");
      table.string("immatriculation", 20);
      table.integer("sejour_nb_envisage");
      table.text("sejour_commentaire");
      table.integer("vacanciers_nb_envisage");
      table.text("animation_autre");
      table.integer("accomp_resp_nb");
      table.text("accomp_resp_comp_exp");
      table.text("accomp_resp_recrute_urg");
      table.boolean("accomp_resp_attest_hono");
      table.string("transport_aller_retour", 50);
      table.string("transport_sejour", 50);
      table.text("suivi_med_distribution");
      table.text("suivi_med_accord_sejour");
      table.text("protocole_evac_urg");
      table.text("protocole_rapat_urg");
      table.text("protocole_rapat_etranger");
      table.text("protocole_materiel");
      table.text("protocole_info_famille");
      table.text("protocole_remboursement");
      table.text("budget_gestion_perso");
      table.text("budget_paiement_securise");
      table.text("budget_complement");
      table.boolean("bilan_changement_evolution");
      table.boolean("bilan_aucun_changement_evolution");
      table.text("bilan_qual_perception_sensibilite");
      table.text("bilan_qual_perspective_evol");
      table.text("bilan_qual_elements_marquants");
      table.text("bilan_financier_comptabilite");
      table.text("bilan_financier_comparatif");
      table.text("bilan_financier_ressources_humaines");
      table.text("bilan_financier_commentaire");
    });

  // --- TABLE activite ---
  await knex.schema.withSchema("front").createTable("activite", (table) => {
    table.increments("id").primary();
    table.string("code", 10).notNullable().unique();
    table.string("libelle", 50).notNullable();
    table
      .enu("activite_type", [], {
        enumName: "activite_type",
        existingType: true,
        useNative: true,
      })
      .notNullable();
  });

  // --- TABLE agrement_files ---
  await knex.schema
    .withSchema("front")
    .createTable("agrement_files", (table) => {
      table.increments("id").primary();
      table.bigInteger("agrement_id").notNullable().index();
      table
        .enu("category", [], {
          enumName: "file_category",
          existingType: true,
          useNative: true,
        })
        .notNullable();
      table.uuid("file_uuid").notNullable();
      table.timestamps(true, true);
      table.foreign("agrement_id").references("id").inTable("front.agrements");
    });

  // --- TABLE agrement_animation ---
  await knex.schema
    .withSchema("front")
    .createTable("agrement_animation", (table) => {
      table.integer("activite_id").references("id").inTable("front.activite");
      table.foreign("agrement_id").references("id").inTable("front.agrements");
    });

  // --- TABLE agrement_sejours ---
  await knex.schema
    .withSchema("front")
    .createTable("agrement_sejours", (table) => {
      table.increments("id").primary();
      table.bigInteger("agrement_id").notNullable().index();
      table.bigInteger("adresse_id").notNullable().index();
      table.timestamps(true, true);
      table.foreign("adresse_id").references("id").inTable("front.adresse");
      table.foreign("agrement_id").references("id").inTable("front.agrements");
    });

  // --- TABLE agrement_bilan_annuel ---
  await knex.schema
    .withSchema("front")
    .createTable("agrement_bilan_annuel", (table) => {
      table.increments("id").primary();
      table.bigInteger("agrement_id").notNullable().index();
      table.integer("annee").notNullable();
      table.integer("nb_global_vacanciers");
      table.integer("nb_hommes");
      table.integer("nb_femmes");
      table.integer("nb_total_jours_vacances");
      table.specificType("type_handicap", "varchar(20)[]");
      table.specificType("tranche_age", "varchar(20)[]");
      table.timestamps(true, true);
      table.foreign("agrement_id").references("id").inTable("front.agrements");
    });

  // --- TABLE bilan_hebergement ---
  await knex.schema
    .withSchema("front")
    .createTable("bilan_hebergement", (table) => {
      table.increments("id").primary();
      table.bigInteger("agr_bilan_annuel_id").notNullable().index();
      table.bigInteger("adresse_id").index();
      table.integer("nb_jours");
      table.specificType("mois", "int[]");
      table.timestamps(true, true);
      table
        .foreign("agr_bilan_annuel_id")
        .references("id")
        .inTable("front.agrement_bilan_annuel");
    });

  // Données à insérer
  const activites = [
    // --- SPORT ---
    { id_tech: 1, activite_type: "SPORT", libelle: "Baignade" },
    { id_tech: 2, activite_type: "SPORT", libelle: "Randonnée" },
    {
      id_tech: 3,
      activite_type: "SPORT",
      libelle: "Voile, char à voile, rafting",
    },
    { id_tech: 4, activite_type: "SPORT", libelle: "Tir à l'arc" },
    { id_tech: 5, activite_type: "SPORT", libelle: "ULM" },
    { id_tech: 6, activite_type: "SPORT", libelle: "Equitation" },
    { id_tech: 7, activite_type: "SPORT", libelle: "Ski" },
    { id_tech: 8, activite_type: "SPORT", libelle: "Sports nautiques" },
    { id_tech: 9, activite_type: "SPORT", libelle: "Pêche" },
    { id_tech: 10, activite_type: "SPORT", libelle: "Autres" },

    // --- CULTURE ---
    {
      id_tech: 1,
      activite_type: "CULTURE",
      libelle: "Visites touristiques, géographiques",
    },
    {
      id_tech: 2,
      activite_type: "CULTURE",
      libelle: "Spectacles, animations, musées",
    },
    { id_tech: 3, activite_type: "CULTURE", libelle: "Musique" },
    { id_tech: 4, activite_type: "CULTURE", libelle: "Expression théâtrale" },
    { id_tech: 5, activite_type: "CULTURE", libelle: "Arts plastiques" },
    { id_tech: 6, activite_type: "CULTURE", libelle: "Danse" },
    { id_tech: 7, activite_type: "CULTURE", libelle: "Chant" },
    { id_tech: 8, activite_type: "CULTURE", libelle: "Soirées dansantes" },
    { id_tech: 9, activite_type: "CULTURE", libelle: "Ferme pédagogique" },
    { id_tech: 10, activite_type: "CULTURE", libelle: "Autres" },
  ];

  await knex("front.activite").insert(activites);
};

exports.down = async function (knex) {
  await knex.schema
    .withSchema("front")
    .dropTableIfExists("bilan_hebergement")
    .dropTableIfExists("agrement_bilan_annuel")
    .dropTableIfExists("agrement_sejours")
    .dropTableIfExists("agrement_animation")
    .dropTableIfExists("agrement_files")
    .dropTableIfExists("activite");

  await knex.schema
    .withSchema("front")
    .alterTable("agrements", function (table) {
      table.dropColumn("statut");
      table.dropColumn("update_at");
      table.dropColumn("date_obtention_certificat");
      table.dropColumn("date_depot");
      table.dropColumn("date_verif_completure");
      table.dropColumn("date_confirm_completude");
      table.dropColumn("commentaire");
      table.dropColumn("motivations");
      table.dropColumn("immatriculation");
      table.dropColumn("sejour_nb_envisage");
      table.dropColumn("sejour_commentaire");
      table.dropColumn("vacanciers_nb_envisage");
      table.dropColumn("animation_autre");
      table.dropColumn("accomp_resp_nb");
      table.dropColumn("accomp_resp_comp_exp");
      table.dropColumn("accomp_resp_recrute_urg");
      table.dropColumn("accomp_resp_attest_hono");
      table.dropColumn("transport_aller_retour");
      table.dropColumn("transport_sejour");
      table.dropColumn("suivi_med_distribution");
      table.dropColumn("suivi_med_accord_sejour");
      table.dropColumn("protocole_evac_urg");
      table.dropColumn("protocole_rapat_urg");
      table.dropColumn("protocole_rapat_etranger");
      table.dropColumn("protocole_materiel");
      table.dropColumn("protocole_info_famille");
      table.dropColumn("protocole_remboursement");
      table.dropColumn("budget_gestion_perso");
      table.dropColumn("budget_paiement_securise");
      table.dropColumn("budget_complement");
      table.dropColumn("bilan_changement_evolution");
      table.dropColumn("bilan_aucun_changement_evolution");
      table.dropColumn("bilan_qual_perception_sensibilite");
      table.dropColumn("bilan_qual_perspective_evol");
      table.dropColumn("bilan_qual_elements_marquants");
      table.dropColumn("bilan_financier_comptabilite");
      table.dropColumn("bilan_financier_comparatif");
      table.dropColumn("bilan_financier_ressources_humaines");
      table.dropColumn("bilan_financier_commentaire");
    });

  await knex.schema.raw(`DROP TYPE IF EXISTS front.activite_type;`);
  await knex.schema.raw(`DROP TYPE IF EXISTS front.file_category;`);
  await knex.schema.raw(`DROP TYPE IF EXISTS front.agrement_statut;`);
};
