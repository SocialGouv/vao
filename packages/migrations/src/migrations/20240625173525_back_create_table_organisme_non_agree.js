/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`
    CREATE TABLE back.organisme_non_agree (
      id                 SERIAL               NOT NULL,
      siret              VARCHAR(14)          NOT NULL,
      nom                VARCHAR(128)         NOT NULL,
      region_delivrance  VARCHAR(15)          NOT NULL REFERENCES geo.territoires(code),
      nature_decision    VARCHAR(100)         NOT NULL,
      date_decision      DATE                 NOT NULL,
      created_at         TIMESTAMP            DEFAULT current_timestamp NOT NULL,
      edited_at          TIMESTAMP            DEFAULT current_timestamp NOT NULL,
      CONSTRAINT pk_back_organisme_non_agree PRIMARY KEY (id)
    );

    INSERT INTO back.organisme_non_agree(region_delivrance,nom,siret,nature_decision,date_decision) VALUES ('AURA','OXYGENE','83294122300022','Non renouvellement','2023-08-28');
    INSERT INTO back.organisme_non_agree(region_delivrance,nom,siret,nature_decision,date_decision) VALUES ('AURA','Vacances et Dépendances','42095466100039','Retrait','2023-10-20');
    INSERT INTO back.organisme_non_agree(region_delivrance,nom,siret,nature_decision,date_decision) VALUES ('IDF','LVEB','87858398800026','Retrait','2023-10-06');
    INSERT INTO back.organisme_non_agree(region_delivrance,nom,siret,nature_decision,date_decision) VALUES ('HDF','Destination voyages adaptés (DVA)','82767360900034','Suspension','2024-03-15');
    INSERT INTO back.organisme_non_agree(region_delivrance,nom,siret,nature_decision,date_decision) VALUES ('BRE','ALISA 35','44864494800029','Agrément expiré, sans demande de renouvellement','2023-04-05');
    INSERT INTO back.organisme_non_agree(region_delivrance,nom,siret,nature_decision,date_decision) VALUES ('BRE','ADAPEI 35','77559092000788','Agrément expiré, sans demande de renouvellement','2021-04-10');
    INSERT INTO back.organisme_non_agree(region_delivrance,nom,siret,nature_decision,date_decision) VALUES ('BRE','ATHEOL','43497718700021','Agrément expiré, sans demande de renouvellement','2021-07-24');
    INSERT INTO back.organisme_non_agree(region_delivrance,nom,siret,nature_decision,date_decision) VALUES ('BRE','Fédération Loisirs Pluriel','84436832400076','Agrément expiré, sans demande de renouvellement','2023-07-16');
    INSERT INTO back.organisme_non_agree(region_delivrance,nom,siret,nature_decision,date_decision) VALUES ('BRE','Hélène Carmalo Centre Gué Larron','40196925800029','Agrément expiré, sans demande de renouvellement','2021-05-19');
    INSERT INTO back.organisme_non_agree(region_delivrance,nom,siret,nature_decision,date_decision) VALUES ('NOR','LELIOS','50144969800023','Agrément expiré, sans demande de renouvellement','2022-06-23');
    INSERT INTO back.organisme_non_agree(region_delivrance,nom,siret,nature_decision,date_decision) VALUES ('NOR','HANDI''WAYS','81983668500019','Agrément expiré, sans demande de renouvellement','2022-06-23');
    INSERT INTO back.organisme_non_agree(region_delivrance,nom,siret,nature_decision,date_decision) VALUES ('OCC','Association Chemin Faisant','79900008800028','Agrément expiré, sans demande de renouvellement','2023-03-06');
    INSERT INTO back.organisme_non_agree(region_delivrance,nom,siret,nature_decision,date_decision) VALUES ('OCC','Les PEP 12','30204902800368','Agrément expiré, sans demande de renouvellement','2023-08-21');
    INSERT INTO back.organisme_non_agree(region_delivrance,nom,siret,nature_decision,date_decision) VALUES ('OCC','VACANCES EVASION','38805773900046','Agrément expiré, sans demande de renouvellement','2023-09-20');
    INSERT INTO back.organisme_non_agree(region_delivrance,nom,siret,nature_decision,date_decision) VALUES ('OCC','APAEHM (CIGALIERES depuis 2020)','44209966900230','Agrément expiré, sans demande de renouvellement','2023-12-07');
    INSERT INTO back.organisme_non_agree(region_delivrance,nom,siret,nature_decision,date_decision) VALUES ('OCC','DES MAINS LIBRES','52870031300026','Agrément expiré, sans demande de renouvellement','2024-05-14');
    INSERT INTO back.organisme_non_agree(region_delivrance,nom,siret,nature_decision,date_decision) VALUES ('GRE','APAJH 54','32073636600040','Liquidation judiciaire ','2024-04-08');
    INSERT INTO back.organisme_non_agree(region_delivrance,nom,siret,nature_decision,date_decision) VALUES ('GRE','ASLV Association Service Loisirs Vacances','42146241700021','Liquidation judiciaire ','2024-04-02');

    GRANT ALL ON TABLE back.organisme_non_agree TO vao_u;
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw(`
    DROP TABLE back.organisme_non_agree;
    `);
};
