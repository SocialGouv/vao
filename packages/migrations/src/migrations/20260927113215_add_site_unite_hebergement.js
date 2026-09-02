/*
Diagramme au format MD

```mermaid
erDiagram
    SITE ||--o{ SITE_ORGANISME : "possède"
    ORGANISMES ||--o{ SITE_ORGANISME : "rattaché à"

    SITE ||--o{ UNITE_HEBERGEMENT : "contient"

    ADRESSE ||--o{ SITE : "adresse"

    UNITE_HEBERGEMENT ||--o{ UNITE_HEBERGEMENT_TO_TYPE_PENSION : "possède"
    HEBERGEMENT_TYPE_PENSION ||--o{ UNITE_HEBERGEMENT_TO_TYPE_PENSION : "définit"

    UNITE_HEBERGEMENT ||--o{ HEBERGEMENT_TYPE : "type"
```

*/
const postgresUser = process.env.PG_VAO_USER;

if (!postgresUser) {
  throw new Error("PG_VAO_USER environment variable is required");
}

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
    resp_nom_prenom			  varchar(120) NULL,
    resp_telephone        varchar(20) NULL,
    resp_email            varchar(320) NULL,
    CONSTRAINT fk_site_organisme_site_id
          FOREIGN KEY (site_id)
          REFERENCES front.site(site_id),
    CONSTRAINT fk_site_organisme_org_id
          FOREIGN KEY (organisme_id)
          REFERENCES front.organismes(id),
    CONSTRAINT pk_site_organisme
      PRIMARY KEY (site_id, organisme_id)
  );

  CREATE INDEX IF NOT EXISTS idx_site_org_organisme_id
      ON front.site_organisme USING btree (organisme_id);

  CREATE INDEX IF NOT EXISTS idx_site_site_id
      ON front.site_organisme USING btree (site_id);

  CREATE INDEX IF NOT EXISTS idx_site_adresse_id
      ON front.site USING btree (adresse_id);

  GRANT ALL ON TABLE front.site TO ${postgresUser};
  GRANT ALL ON SEQUENCE front.site_id_seq TO ${postgresUser};

  GRANT ALL ON TABLE front.site_organisme TO ${postgresUser};

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
      UNIQUE (hebergement_id),
    CONSTRAINT fk_unite_hebergement_statut
      FOREIGN KEY (statut_id)
      REFERENCES front.hebergement_statut(id));

  CREATE INDEX IF NOT EXISTS idx_unite_hebergement_organisme_id
  ON front.unite_hebergement USING btree (organisme_id);

  CREATE INDEX IF NOT EXISTS idx_unite_hebergement_site_id
  ON front.unite_hebergement USING btree (site_id);

  GRANT ALL ON TABLE front.unite_hebergement TO ${postgresUser};
  GRANT ALL ON SEQUENCE front.unite_hebergement_id_seq TO ${postgresUser};

  CREATE TABLE front.unite_hebergement_to_type_pension (
      unite_hebergement_id        int4 not null,
      type_pension_id       int4 not null,
  CONSTRAINT pk_unite_hebergement_type_pension primary key (
      unite_hebergement_id,
      type_pension_id),
  CONSTRAINT fk_uhtp_unite_hebergement
      FOREIGN KEY (unite_hebergement_id)
      REFERENCES front.unite_hebergement(id) ON DELETE CASCADE,
  CONSTRAINT fk_uhtp_type_pension
      FOREIGN KEY (type_pension_id)
      REFERENCES front.hebergement_type_pension(id));

  GRANT ALL on table front.unite_hebergement_to_type_pension to ${postgresUser};

  -- Ajout du site sur l'hébergment actuel pour compatibilité migration future
  ALTER TABLE front.hebergement ADD COLUMN site_id uuid null;

  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw(`
    ALTER TABLE front.hebergement DROP COLUMN site_id;
    DROP TABLE IF EXISTS front.unite_hebergement_to_type_pension;
    DROP TABLE IF EXISTS front.unite_hebergement;
    DROP TABLE IF EXISTS front.site_organisme;
    DROP TABLE IF EXISTS front.site;
    DROP INDEX IF EXISTS front.idx_site_site_id;
    DROP INDEX IF EXISTS front.idx_site_org_organisme_id;
    DROP INDEX IF EXISTS front.idx_site_adresse_id;
    DROP INDEX IF EXISTS front.idx_unite_hebergement_organisme_id;
  `);
};
