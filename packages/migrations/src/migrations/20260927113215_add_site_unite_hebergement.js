/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`
  /* ============================================================
    TABLE SITE
    ============================================================ */

  CREATE TABLE IF NOT EXISTS front.site
  (
    id              			serial NOT NULL,
    site_id         			uuid DEFAULT gen_random_uuid() NOT NULL,
    "current"       			bool DEFAULT true NOT NULL,
    adresse_id    		    int4 NULL,
    nom_site_officiel     varchar(120) NULL,
    hebergement_type_id   int4 NULL, -- Type de site
    descriptif				    text NULL,
    resp_nom_prenom			  varchar(120) NULL,
    resp_telephone        varchar(20) NULL,
    resp_email            varchar(320) NULL,
    created_at      		  timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    edited_at       		  timestamp DEFAULT CURRENT_TIMESTAMP NULL,
    created_by            int4 NULL,
    edited_by             int4 NULL,
      CONSTRAINT pk_site
          PRIMARY KEY (id),
      CONSTRAINT uq_site_id
          UNIQUE (site_id),
      CONSTRAINT fk_site_adresse
          FOREIGN KEY (adresse_id)
          REFERENCES front.adresse(id),
    CONSTRAINT fk_site_hebergement_type
          FOREIGN KEY (hebergement_type_id)
          REFERENCES front.hebergement_type(id)
  );

  /* ============================================================
    TABLE SITE_ORGANISME
    ============================================================ */

  CREATE TABLE IF NOT EXISTS front.site_organisme
  (
    site_id         uuid NOT NULL,
    organisme_id    int4 NOT NULL,
    nom_site        varchar(120) NULL,
    CONSTRAINT fk_site_organisme_site_id
          FOREIGN KEY (site_id)
          REFERENCES front.site(site_id),
    CONSTRAINT fk_site_organisme_org_id
          FOREIGN KEY (organisme_id)
          REFERENCES front.organismes(id),
    CONSTRAINT pk_site_organisme
      PRIMARY KEY (site_id, organisme_id)
  );

  CREATE UNIQUE INDEX idx_site_org_organisme_id
      ON front.organismes USING btree (id);

  CREATE UNIQUE INDEX idx_site_site_id
      ON front.site USING btree (site_id);

  CREATE INDEX IF NOT EXISTS idx_site_adresse_id
      ON front.site USING btree (adresse_id);

  GRANT ALL ON TABLE front.site TO vao_u;
  GRANT ALL ON SEQUENCE front.site_id_seq TO vao_u;

  GRANT ALL ON TABLE front.site_organisme TO vao_u;

  /* ============================================================
    TABLE UNITE_HEBERGEMENT
    ============================================================ */

  CREATE TABLE front.unite_hebergement (
    id                                      serial NOT NULL,
    site_id                                 uuid NOT NULL,
    organisme_id                            int4 NOT NULL,
    statut_id                               int4 NULL,
    created_at                              timestamp default CURRENT_TIMESTAMP NOT NULL,
    edited_at                               timestamp default CURRENT_TIMESTAMP NOT NULL,
    hebergement_id                          uuid default gen_random_uuid() NOT NULL,
    "current"                               bool default true NOT NULL,
    created_by                              int4 NULL,
    edited_by                               int4 NULL,
    hebergement_type_id                     int4 NULL,
    nombre_couchage_total                   int4 NULL,
    lits_superposes                         bool NULL,
    accessibilite_pmr                       bool NULL,
    accessibilite_precision                 text NULL,
    chambres_doubles                        bool NULL,
    separation_homme_femme                  bool NULL,
    reglementation_erp                      bool NULL,
    couchage_individuel                     bool NULL,
    rangement_individuel                    bool NULL,
    amenagements_specifiques                bool NULL,
    amenagements_specifiques_precision      text NULL,
    excursion_description                   text NULL,
    file_reponse_exploitant_ou_proprietaire uuid NULL,
    file_dernier_arrete_autorisation_maire  uuid NULL,
    file_derniere_attestation_securite      uuid NULL,
    visite_locaux                       bool NULL,
    visite_locaux_at                    timestamp NULL,
    deplacement_proximite_description   text NULL,
    vehicules_adaptes                   bool NULL,
    CONSTRAINT pk_unite_hebergement
    PRIMARY KEY (id),
    CONSTRAINT fk_unite_hebergement_site
      FOREIGN KEY (site_id)
      REFERENCES front.site(site_id),
    CONSTRAINT fk_uho_organisme_id
      FOREIGN KEY (organisme_id)
      REFERENCES front.organismes(id),
    CONSTRAINT uq_unite_hebergement_id
      UNIQUE (hebergement_id));

    CREATE UNIQUE INDEX idx_unite_hebergement_organisme_id
    ON front.organismes USING btree (id);

  GRANT ALL ON TABLE front.unite_hebergement TO vao_u;
  GRANT ALL ON SEQUENCE front.unite_hebergement_id_seq TO vao_u;

  CREATE TABLE front.unite_hebergement_to_type_pension (
      unite_hebergement_id        int4 not null,
      type_pension_id       int4 not null,
  CONSTRAINT pk_unite_hebergement_type_pension primary key (
      unite_hebergement_id,
      type_pension_id));

  GRANT ALL on table front.unite_hebergement_to_type_pension to vao_u;

  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw(`
    DROP TABLE IF EXISTS unite_hebergement_to_type_pension;
    DROP TABLE IF EXISTS front.unite_hebergement;
    DROP TABLE IF EXISTS front.site_organisme;
    DROP TABLE IF EXISTS front.site;
    DROP INDEX IF EXISTS idx_site_site_id;
    DROP INDEX IF EXISTS idx_site_org_organisme_id;
    DROP INDEX IF EXISTS idx_site_adresse_id;
    DROP INDEX IF EXISTS idx_unite_hebergement_organisme_id;
  `);
};
