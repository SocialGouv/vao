/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`
    -- Personne Morale
    CREATE TABLE front.personne_morale (
        id SERIAL PRIMARY KEY,
        organisme_id INTEGER REFERENCES front.organismes (id),
        pays VARCHAR(100),
        email VARCHAR(255),
        siren VARCHAR(9),
        siret VARCHAR(14),
        statut VARCHAR(255),
        adresse TEXT,
        telephone VARCHAR(15),
        siege_social BOOLEAN,
        nom_commercial VARCHAR(255),
        raison_sociale VARCHAR(255),
        porteur_agrement BOOLEAN,
        resp_sejour_nom VARCHAR(255),
        resp_sejour_prenom VARCHAR(255),
        resp_sejour_email VARCHAR(255),
        resp_sejour_adresse_label TEXT,
        resp_sejour_adresse_cle_insee VARCHAR(50),
        resp_sejour_adresse_code_insee VARCHAR(5),
        resp_sejour_adresse_code_postal VARCHAR(5),
        resp_sejour_adresse_long DOUBLE PRECISION,
        resp_sejour_adresse_lat DOUBLE PRECISION,
        resp_sejour_adresse_departement VARCHAR(4) REFERENCES GEO.TERRITOIRES (CODE),
        resp_sejour_fonction VARCHAR(255),
        resp_sejour_telephone VARCHAR(15),
        etab_principal_siret VARCHAR(14),
        etab_principal_adresse TEXT,
        etab_principal_telephone VARCHAR(15),
        etab_principal_nom_commercial VARCHAR(255),
        etab_principal_raison_sociale VARCHAR(255),
        etab_principal_pays VARCHAR(100),
        etab_principal_email VARCHAR(255)
    );
    INSERT INTO front.personne_morale (
        organisme_id, 
        pays, 
        email, 
        siren, 
        siret, 
        statut, 
        adresse, 
        telephone, 
        siege_social, 
        nom_commercial, 
        raison_sociale,
        porteur_agrement,
        resp_sejour_nom,
        resp_sejour_prenom,
        resp_sejour_email,
        resp_sejour_adresse_label,
        resp_sejour_adresse_cle_insee,
        resp_sejour_adresse_code_insee,
        resp_sejour_adresse_code_postal,
        resp_sejour_adresse_long,
        resp_sejour_adresse_lat,
        resp_sejour_adresse_departement,
        resp_sejour_fonction,
        resp_sejour_telephone,
        etab_principal_siret,
        etab_principal_adresse,
        etab_principal_telephone,
        etab_principal_nom_commercial,
        etab_principal_raison_sociale,
        etab_principal_pays,
        etab_principal_email
    )
    SELECT 
        id AS organisme_id, 
        personne_morale->>'pays' AS pays,
        personne_morale->>'email' AS email,
        personne_morale->>'siren' AS siren,
        personne_morale->>'siret' AS siret,
        personne_morale->>'statut' AS statut,
        personne_morale->>'adresse' AS adresse,
        personne_morale->>'telephone' AS telephone,
        (personne_morale->>'siegeSocial')::BOOLEAN AS siege_social,
        personne_morale->>'nomCommercial' AS nom_commercial,
        personne_morale->>'raisonSociale' AS raison_sociale,
        (personne_morale->>'porteurAgrement')::BOOLEAN AS porteur_agrement,
        personne_morale->'responsableSejour'->>'nom' AS resp_sejour_nom,
        personne_morale->'responsableSejour'->>'prenom' AS resp_sejour_prenom,
        personne_morale->'responsableSejour'->>'email' AS resp_sejour_email,
        personne_morale->'responsableSejour'->'adresse'->>'label' AS resp_sejour_adresse_label,
        personne_morale->'responsableSejour'->'adresse'->>'cleInsee' AS resp_sejour_adresse_cle_insee,
        personne_morale->'responsableSejour'->'adresse'->>'codeInsee' AS resp_sejour_adresse_code_insee,
        personne_morale->'responsableSejour'->'adresse'->>'codePostal' AS resp_sejour_adresse_code_postal,
        (personne_morale->'responsableSejour'->'adresse'->'coordinates'->1)::DOUBLE PRECISION AS resp_sejour_adresse_long,
        (personne_morale->'responsableSejour'->'adresse'->'coordinates'->1)::DOUBLE PRECISION AS resp_sejour_adresse_lat,
        personne_morale->'responsableSejour'->'adresse'->>'departement' AS resp_sejour_adresse_departement,
        personne_morale->'responsableSejour'->>'fonction' AS resp_sejour_fonction,
        personne_morale->'responsableSejour'->>'telephone' AS resp_sejour_telephone,
        personne_morale->'etablissementPrincipal'->>'siret' etab_principal_siret,
        personne_morale->'etablissementPrincipal'->>'adresse' etab_principal_adresse,
        personne_morale->'etablissementPrincipal'->>'telephone' AS etab_principal_telephone,
        personne_morale->'etablissementPrincipal'->>'nomCommercial' etab_principal_nom_commercial,
        personne_morale->'etablissementPrincipal'->>'raisonSociale' etab_principal_raison_sociale,
        personne_morale->'etablissementPrincipal'->>'pays' etab_principal_pays,
        personne_morale->'etablissementPrincipal'->>'email' etab_principal_email
    FROM front.organismes
    WHERE front.organismes.personne_morale is not null AND front.organismes.personne_morale <> '{}'::JSONB;

    -- Création de la table pour les établissements
    CREATE TABLE front.opm_etablissements (
        id SERIAL PRIMARY KEY,
        personne_morale_id INT,
        nic VARCHAR(5) NOT NULL,
        siret VARCHAR(14),
        adresse TEXT,
        commune VARCHAR(100),
        enabled BOOLEAN,
        code_postal VARCHAR(10),
        denomination VARCHAR(255),
        etat_administratif VARCHAR(50),
        FOREIGN KEY (personne_morale_id) REFERENCES front.personne_morale (id)
    );

    INSERT INTO front.opm_etablissements (personne_morale_id, nic, siret, adresse, commune, enabled, code_postal, denomination, etat_administratif)
      SELECT 
          opm.id AS personne_morale_id,
          e->>'nic' AS nic,
          e->>'siret' AS siret,
          e->>'adresse' AS adresse,
          e->>'commune' AS commune,
          (e->>'enabled')::BOOLEAN AS enabled,
          e->>'codePostal' AS code_postal,
          e->>'denomination' AS denomination,
          e->>'etatAdministratif' AS etat_administratif
      FROM front.organismes o
      INNER JOIN front.personne_morale opm ON opm.organisme_id = o.id,
          JSONB_ARRAY_ELEMENTS(o.personne_morale->'etablissements') AS e
      WHERE personne_morale IS NOT NULL;

    -- Personne Physique
    CREATE TABLE front.personne_physique (
      id SERIAL PRIMARY KEY,
      organisme_id INTEGER REFERENCES front.organismes (id),
      prenom VARCHAR(255),
      nom_usage VARCHAR(255),
      nom_naissance VARCHAR(255),
      telephone VARCHAR(15),
      profession VARCHAR(255),
      adresse_siege_label TEXT,
      adresse_siege_cle_insee VARCHAR(50),
      adresse_siege_code_insee VARCHAR(5),
      adresse_siege_code_postal VARCHAR(5),
      adresse_siege_long DOUBLE PRECISION,
      adresse_siege_lat DOUBLE PRECISION,
      adresse_siege_departement VARCHAR(4) REFERENCES GEO.TERRITOIRES (CODE),
      adresse_domicile_label TEXT,
      adresse_domicile_cle_insee VARCHAR(50),
      adresse_domicile_code_insee VARCHAR(5),
      adresse_domicile_code_postal VARCHAR(5),
      adresse_domicile_long DOUBLE PRECISION,
      adresse_domicile_lat DOUBLE PRECISION,
      adresse_domicile_departement VARCHAR(4) REFERENCES GEO.TERRITOIRES (CODE),
      adresse_identique BOOLEAN
    );
    
    INSERT INTO front.personne_physique (
      organisme_id, 
      prenom,
      nom_naissance,
      nom_usage,
      telephone,
      profession,
      adresse_siege_label,
      adresse_siege_cle_insee,
      adresse_siege_code_insee,
      adresse_siege_code_postal,
      adresse_siege_long,
      adresse_siege_lat,
      adresse_siege_departement,
      adresse_domicile_label,
      adresse_domicile_cle_insee,
      adresse_domicile_code_insee,
      adresse_domicile_code_postal,
      adresse_domicile_long,
      adresse_domicile_lat,
      adresse_domicile_departement,
      adresse_identique
    )
    SELECT 
      id AS organisme_id, 
      personne_physique->>'prenom' AS prenom,
      personne_physique->>'nomNaissance' AS nom_naissance,
      personne_physique->>'nomUsage' AS nom_usage,
      personne_physique->>'telephone' AS telephone,
      personne_physique->>'profession' AS profession,
      personne_physique->'adresseSiege'->>'label' AS adresse_siege_label,
      personne_physique->'adresseSiege'->>'cleInsee' AS adresse_siege_cle_insee,
      personne_physique->'adresseSiege'->>'codeInsee' AS adresse_siege_code_insee,
      personne_physique->'adresseSiege'->>'codePostal' AS adresse_siege_code_postal,
      (personne_physique->'adresseSiege'->'coordinates'->0)::DOUBLE PRECISION AS adresse_siege_long,
      (personne_physique->'adresseSiege'->'coordinates'->1)::DOUBLE PRECISION AS adresse_siege_lat,
      personne_physique->'adresseSiege'->>'departement' AS adresse_siege_departement,
      personne_physique->'adresseDomicile'->>'label' AS adresse_domicile_label,
      personne_physique->'adresseDomicile'->>'cleInsee' AS adresse_domicile_cle_insee,
      personne_physique->'adresseDomicile'->>'codeInsee' AS adresse_domicile_code_insee,
      personne_physique->'adresseDomicile'->>'codePostal' AS adresse_domicile_code_postal,
      (personne_physique->'adresseDomicile'->'coordinates'->0)::DOUBLE PRECISION AS adresse_domicile_long,
      (personne_physique->'adresseDomicile'->'coordinates'->1)::DOUBLE PRECISION AS adresse_domicile_lat,
      personne_physique->'adresseDomicile'->>'departement' AS adresse_domicile_departement,
      (personne_physique->>'adresseIdentique')::BOOLEAN AS adresse_identique
    FROM front.organismes
    WHERE front.organismes.personne_physique is not null AND front.organismes.personne_physique <> '{}'::JSONB;
    
    --Protocole Sanitaire
    CREATE TABLE front.org_protocole_sanitaire (
      id SERIAL PRIMARY KEY,
      organisme_id INTEGER REFERENCES front.organismes (id),
      accord_cabinet_medical BOOLEAN,
      conservation_medicament_thermosensible BOOLEAN,
      dispositions_specifiques BOOLEAN,
      fiche_suivi_medicaments BOOLEAN,
      files UUID,
      gestion_budget_personnel TEXT,
      individualisation_medicaments BOOLEAN,
      precision_accord_cabinet_medical TEXT,
      precision_constitution_equipe TEXT,
      precision_dispositions_specifiques TEXT,
      precision_individualisation_medicaments TEXT,
      precision_preparation_pilluliers TEXT,
      precision_protocole_accident TEXT,
      precision_protocole_canicule TEXT,
      precision_protocole_evacuation TEXT,
      precision_protocole_modification_traitement TEXT,
      precision_protocole_reorientation TEXT,
      precision_responsable_administration_medicament TEXT,
      precision_stockage_medicament_securise TEXT,
      preparation_pilluliers TEXT,
      prescription_medicale_jointe BOOLEAN,
      protocole_accident BOOLEAN,
      protocole_canicule BOOLEAN,
      protocole_evacuation BOOLEAN,
      protocole_modification_traitement BOOLEAN,
      protocole_reorientation BOOLEAN,
      stockage_medicament_securise BOOLEAN,
      trousse_pharmacie BOOLEAN
    );
    
    INSERT INTO front.org_protocole_sanitaire (
      organisme_id,
      gestion_budget_personnel,
      precision_accord_cabinet_medical,
      precision_constitution_equipe,
      precision_dispositions_specifiques,
      precision_individualisation_medicaments,
      precision_preparation_pilluliers,
      precision_protocole_accident,
      precision_protocole_canicule,
      precision_protocole_evacuation,
      precision_protocole_modification_traitement,
      precision_protocole_reorientation,
      precision_responsable_administration_medicament,
      precision_stockage_medicament_securise,
      preparation_pilluliers,
      accord_cabinet_medical,
      conservation_medicament_thermosensible,
      dispositions_specifiques,
      fiche_suivi_medicaments,
      individualisation_medicaments,
      prescription_medicale_jointe,
      protocole_accident,
      protocole_canicule,
      protocole_evacuation,
      protocole_modification_traitement,
      protocole_reorientation,
      stockage_medicament_securise,
      trousse_pharmacie,
      files
    )
    SELECT 
      id AS organisme_id, 
      protocole_sanitaire->>'gestionBudgetPersonnel' AS gestion_budget_personnel,
      protocole_sanitaire->>'precisionAccordCabinetMedical' AS precision_accord_cabinet_medical,
      protocole_sanitaire->>'precisionConstitutionEquipe' AS precision_constitution_equipe,
      protocole_sanitaire->>'precisionDispositionsSpecifiques' AS precision_dispositions_specifiques,
      protocole_sanitaire->>'precisionIndividualisationMedicaments' AS precision_individualisation_medicament,
      protocole_sanitaire->>'precisionPreparationPilluliers' AS precision_preparation_pilluliers,
      protocole_sanitaire->>'precisionProtocoleAccident' AS precision_protocole_accident,
      protocole_sanitaire->>'precisionProtocoleCanicule' AS precision_protocole_canicule,
      protocole_sanitaire->>'precisionProtocoleEvacuation' AS precision_protocole_evacuation,
      protocole_sanitaire->>'precisionProtocoleModificationTraitement' AS precision_protocole_modification_traitement,
      protocole_sanitaire->>'precisionProtocoleReorientation' AS precision_protocole_reorientation,
      protocole_sanitaire->>'precisionResponsableAdministrationMedicament' AS precision_responsable_administration_medicament,
      protocole_sanitaire->>'precisionStockageMedicamentSecurise' AS precision_stockage_medicament_securise,
      protocole_sanitaire->>'preparationPilluliers' AS preparation_pilluliers,
      (protocole_sanitaire->>'accordCabinetMedical')::BOOLEAN AS  accord_cabinet_medical,
      (protocole_sanitaire->>'conservationMedicamentThermosensible')::BOOLEAN AS conservation_medicament_thermosensible,
      (protocole_sanitaire->>'dispositionsSpecifiques')::BOOLEAN AS dispositions_specifiques,
      (protocole_sanitaire->>'ficheSuiviMedicaments')::BOOLEAN AS fiche_suivi_medicaments,
      (protocole_sanitaire->>'individualisationMedicaments')::BOOLEAN AS individualisation_medicaments,
      (protocole_sanitaire->>'prescriptionMedicaleJointe')::BOOLEAN AS prescription_medicale_jointe,
      (protocole_sanitaire->>'protocoleAccident')::BOOLEAN AS protocole_accident,
      (protocole_sanitaire->>'protocoleCanicule')::BOOLEAN AS protocole_canicule,
      (protocole_sanitaire->>'protocoleEvacuation')::BOOLEAN AS protocole_evacuation,
      (protocole_sanitaire->>'protocoleModificationTraitement')::BOOLEAN AS protocole_modification_traitement,
      (protocole_sanitaire->>'protocoleReorientation')::BOOLEAN AS protocole_reorientation,
      (protocole_sanitaire->>'stockageMedicamentSecurise')::BOOLEAN AS stockage_medicament_securise,
      (protocole_sanitaire->>'troussePharmacie')::BOOLEAN AS trousse_pharmacie,
      CASE 
        WHEN jsonb_array_length(protocole_sanitaire->'files') > 0 THEN 
          (protocole_sanitaire->'files'->0->>'uuid')::UUID
        ELSE 
          NULL
      END AS files
    FROM front.organismes
    WHERE front.organismes.protocole_sanitaire is not null AND front.organismes.protocole_sanitaire <> '{}'::JSONB;

    CREATE TABLE front.org_protocole_sanitaire_files (
      id SERIAL PRIMARY KEY,
      protocole_sanitaire_id INTEGER REFERENCES front.org_protocole_sanitaire (id),
      files UUID);

    INSERT INTO front.org_protocole_sanitaire_files (protocole_sanitaire_id, files)
      SELECT 
          ops.id,
          (file->>'uuid')::UUID AS uuid
      FROM front.organismes o
      INNER JOIN front.org_protocole_sanitaire ops ON ops.organisme_id = o.id
      CROSS JOIN LATERAL jsonb_array_elements(protocole_sanitaire->'files') AS file
      WHERE protocole_sanitaire->'files' IS NOT NULL;

    -- Constitution équipe
    CREATE TABLE front.protocole_sanitaire_constitution_equipe (
      ID SERIAL NOT NULL,
      VALUE VARCHAR(100),
      CONSTRAINT pk_protocole_sanitaire_constitution_equipe PRIMARY KEY (ID)
    );
    
    INSERT INTO front.protocole_sanitaire_constitution_equipe (value) values ('personne_formee');
    INSERT INTO front.protocole_sanitaire_constitution_equipe (value) values ('infirmier');
    INSERT INTO front.protocole_sanitaire_constitution_equipe (value) values ('aide_soignant');

    CREATE TABLE front.ops_to_ce (
      protocole_sanitaire_id INTEGER REFERENCES front.org_protocole_sanitaire (id) ON DELETE CASCADE,
      constitution_equipe_id INTEGER REFERENCES front.protocole_sanitaire_constitution_equipe (id) ON DELETE CASCADE,
      CONSTRAINT pk_ops_to_ce PRIMARY KEY (protocole_sanitaire_id, constitution_equipe_id)
    );

    INSERT INTO
      front.ops_to_ce (protocole_sanitaire_id, constitution_equipe_id)
    SELECT
      protocole_sanitaire_id ,
      (
        SELECT
          id 
        FROM
          front.protocole_sanitaire_constitution_equipe
        WHERE
          value = sub_organisme.protocole_sanitaire_constitution_equipe_value
      )
    FROM
      (
        SELECT
          ps.id AS protocole_sanitaire_id,
          JSONB_ARRAY_ELEMENTS(
            o.protocole_sanitaire -> 'constitutionEquipe'::TEXT
          ) ->> 0 AS protocole_sanitaire_constitution_equipe_value
        FROM
          front.organismes o
          INNER JOIN front.org_protocole_sanitaire ps ON ps.organisme_id = o.id
      ) sub_organisme;
    
    -- Responsable Administation Médicaments
    CREATE TABLE front.ps_resp_admin_med (
      ID SERIAL NOT NULL,
      VALUE VARCHAR(100),
      CONSTRAINT pk_ps_responsable_administration_medicament PRIMARY KEY (ID)
    );
    
    INSERT INTO front.ps_resp_admin_med (value) values ('responsable_sejour');
    INSERT INTO front.ps_resp_admin_med (value) values ('accompagnant');
    INSERT INTO front.ps_resp_admin_med (value) values ('professionnel_sante');

    CREATE TABLE front.ops_to_ram (
        protocole_sanitaire_id INTEGER REFERENCES front.org_protocole_sanitaire (id) ON DELETE CASCADE,
        ps_resp_admin_med_id INTEGER REFERENCES front.ps_resp_admin_med (id),
        CONSTRAINT pk_ops_to_ps_resp_admin_med PRIMARY KEY (protocole_sanitaire_id, ps_resp_admin_med_id)
      );

    INSERT INTO
      front.ops_to_ram (protocole_sanitaire_id, ps_resp_admin_med_id)
      SELECT
      protocole_sanitaire_id,
      (
        SELECT
          id
        FROM
          front.ps_resp_admin_med
        WHERE
          value = sub_organisme.protocole_sanitaire_ram_value
        LIMIT 1
      ) AS ps_resp_admin_med_id
      FROM
      (
        SELECT
          ps.id AS protocole_sanitaire_id,
          JSONB_ARRAY_ELEMENTS(
            o.protocole_sanitaire -> 'responsableAdministrationMedicament'::TEXT
          ) ->> 0 AS protocole_sanitaire_ram_value
        FROM front.organismes o
        INNER JOIN front.org_protocole_sanitaire ps ON ps.organisme_id = o.id
        WHERE
          o.protocole_sanitaire IS NOT NULL
          AND o.protocole_sanitaire <> '{}'::JSONB
      ) sub_organisme
      WHERE
      (
        SELECT
          id
        FROM
          front.ps_resp_admin_med
        WHERE
          value = sub_organisme.protocole_sanitaire_ram_value
        LIMIT 1
      ) IS NOT NULL;
    
    CREATE TABLE front.opm_representants_legaux (
      id SERIAL PRIMARY KEY,
      personne_morale_id INT NOT NULL,
      prenom VARCHAR(320),
      nom VARCHAR(320),
      fonction VARCHAR(255),
      FOREIGN KEY (personne_morale_id) REFERENCES front.personne_morale (id)
    );

    INSERT INTO front.opm_representants_legaux (personne_morale_id, prenom, nom, fonction)
    SELECT
      opm.id AS personne_morale_id,
      rl->>'prenom' AS prenom,
      rl->>'nom' AS nom,
      rl->>'fonction' AS fonction
    FROM
      front.organismes o
      INNER JOIN front.personne_morale opm ON opm.organisme_id = o.id,
      jsonb_array_elements(o.personne_morale->'representantsLegaux') rl
      WHERE o.personne_morale is not null AND o.personne_morale <> '{}'::JSONB;
    
    --Protocole Transport
    CREATE TABLE front.org_protocole_transport (
        id SERIAL PRIMARY KEY,
        organisme_id INTEGER REFERENCES front.organismes (id),
        vehicules_adaptes BOOLEAN,
        deplacement_durant_sejour BOOLEAN,
        precision_mode_organisation TEXT,
        precision_vehicules_adaptes TEXT
    );
    
    INSERT INTO front.org_protocole_transport (
        organisme_id,
        vehicules_adaptes,
        deplacement_durant_sejour,
        precision_mode_organisation,
        precision_vehicules_adaptes
    )
    SELECT 
        id AS organisme_id, 
        (protocole_transport->>'vehiculesAdaptes')::BOOLEAN AS vehicules_adaptes,
        (protocole_transport->>'deplacementDurantSejour')::BOOLEAN AS deplacement_durant_sejour,
        protocole_transport->>'precisionModeOrganisation' AS precision_mode_organisation,
        protocole_transport->>'precisionVehiculesAdaptes' AS precision_vehicules_adaptes
    FROM front.organismes
    WHERE front.organismes.protocole_transport is not null AND front.organismes.protocole_transport <> '{}'::JSONB;
    
    -- REF Modes de transport
    CREATE TABLE front.protocole_transport_mode (
      ID SERIAL NOT NULL,
      VALUE VARCHAR(100),
      CONSTRAINT pk_protocole_transport_mode PRIMARY KEY (ID)
    );
    
    INSERT INTO front.protocole_transport_mode (value) values ('Avion');
    INSERT INTO front.protocole_transport_mode (value) values ('Train');
    INSERT INTO front.protocole_transport_mode (value) values ('Autobus, car');
    INSERT INTO front.protocole_transport_mode (value) values ('Automobile');
    INSERT INTO front.protocole_transport_mode (value) values ('Bateau');
    INSERT INTO front.protocole_transport_mode (value) values ('Autre');

    -- Modes de transport
    CREATE TABLE front.opt_to_ptm (
      protocole_transport_id INTEGER REFERENCES front.org_protocole_transport (id),
      mode_transport_id INTEGER REFERENCES front.protocole_transport_mode (id),
      CONSTRAINT pk_opt_to_ptm PRIMARY KEY (protocole_transport_id, mode_transport_id)
    );

    INSERT INTO
        front.opt_to_ptm (protocole_transport_id, mode_transport_id)
      SELECT
        protocole_transport_id ,
        (
          SELECT
            id 
          FROM
            front.protocole_transport_mode
          WHERE
            value = sub_organisme.protocole_transport_mode_value
        )
      FROM
        (
          SELECT
            opt.id AS protocole_transport_id,
            JSONB_ARRAY_ELEMENTS(
              o.protocole_transport -> 'modeTransport'::TEXT
            ) ->> 0 AS protocole_transport_mode_value
          FROM
            front.organismes o
          INNER JOIN front.org_protocole_transport opt ON opt.organisme_id = o.id
        ) sub_organisme;

    CREATE TABLE front.protocole_transport_responsable (
      ID SERIAL NOT NULL,
      VALUE VARCHAR(100),
      CONSTRAINT pk_protocole_transport_responsable PRIMARY KEY (ID)
    );
    
    INSERT INTO front.protocole_transport_responsable (value) values ('vacanciers');
    INSERT INTO front.protocole_transport_responsable (value) values ('organisateur');

    -- Responsable du transport
    CREATE TABLE front.opt_to_ptr (
      protocole_transport_id INTEGER REFERENCES front.org_protocole_transport (id),
      responsable_id INTEGER REFERENCES front.protocole_transport_responsable (id),
      CONSTRAINT pk_opt_to_ptr PRIMARY KEY (protocole_transport_id, responsable_id )
    );

    INSERT INTO
      front.opt_to_ptr (protocole_transport_id, responsable_id )
    SELECT
      protocole_transport_id ,
      (
        SELECT
          id 
        FROM
          front.protocole_transport_responsable
        WHERE
          value = sub_organisme.protocole_transport_responsable_value
      )
    FROM
      (
        SELECT
          opt.id AS protocole_transport_id,
          JSONB_ARRAY_ELEMENTS(
            o.protocole_transport -> 'responsableTransportLieuSejour'::TEXT
          ) ->> 0 AS protocole_transport_responsable_value
        FROM
          front.organismes o
        inner join front.org_protocole_transport opt on opt.organisme_id = o.id
      ) sub_organisme;
        
    CREATE TABLE front.org_protocole_transport_files (
      id SERIAL PRIMARY KEY,
      protocole_transport_id INTEGER REFERENCES front.org_protocole_transport (id),
      files UUID);
    
    INSERT INTO front.org_protocole_transport_files (protocole_transport_id, files)
      SELECT 
          opt.id,
          (file->>'uuid')::UUID AS uuid
      FROM front.organismes o
      INNER JOIN front.org_protocole_transport opt ON opt.organisme_id = o.id
      CROSS JOIN LATERAL jsonb_array_elements(protocole_transport->'files') AS file
      WHERE protocole_transport->'files' IS NOT NULL;

    GRANT ALL ON TABLE front.ops_to_ce TO vao_u;
    GRANT ALL ON TABLE front.ops_to_ram TO vao_u;
    GRANT ALL ON TABLE front.protocole_sanitaire_constitution_equipe TO vao_u;
    GRANT ALL ON TABLE front.ps_resp_admin_med TO vao_u;
    GRANT ALL ON TABLE front.opt_to_ptm TO vao_u;
    GRANT ALL ON TABLE front.protocole_transport_mode TO vao_u;
    GRANT ALL ON TABLE front.opt_to_ptr TO vao_u;
    GRANT ALL ON TABLE front.protocole_transport_responsable TO vao_u;
    GRANT ALL ON TABLE front.org_protocole_transport_files TO vao_u;
    GRANT ALL ON TABLE front.opm_representants_legaux TO vao_u;
    GRANT ALL ON TABLE front.opm_etablissements TO vao_u;
    GRANT ALL ON TABLE front.personne_morale TO vao_u;
    GRANT ALL ON TABLE front.personne_morale TO vao_u;
    GRANT ALL ON TABLE front.personne_physique TO vao_u;
    GRANT ALL ON TABLE front.org_protocole_sanitaire TO vao_u;
    GRANT ALL ON TABLE front.org_protocole_sanitaire_files TO vao_u;
    GRANT ALL ON TABLE front.org_protocole_transport TO vao_u;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA front TO vao_u;
`);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw(`
    DROP TABLE front.ops_to_ce;
    DROP TABLE front.ops_to_ram;
    DROP TABLE front.protocole_sanitaire_constitution_equipe;
    DROP TABLE front.ps_resp_admin_med;
    DROP TABLE front.opt_to_ptm;
    DROP TABLE front.protocole_transport_mode;
    DROP TABLE front.opt_to_ptr;
    DROP TABLE front.protocole_transport_responsable;
    DROP TABLE front.org_protocole_transport_files;
    DROP TABLE front.opm_representants_legaux;
    DROP TABLE front.opm_etablissements;
    DROP TABLE front.personne_morale;
    DROP TABLE front.personne_physique;
    DROP TABLE front.org_protocole_sanitaire_files;
    DROP TABLE front.org_protocole_sanitaire;
    DROP TABLE front.org_protocole_transport;
`);
};
