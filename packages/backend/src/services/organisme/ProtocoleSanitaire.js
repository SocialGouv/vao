const logger = require("../../utils/logger");
const pool = require("../../utils/pgpool").getPool();
const { getFileMetaData } = require("../Document");

const log = logger(module.filename);

const query = {
  associateCE: (nbRows) => `
    INSERT INTO
      front.ops_to_ce (protocole_sanitaire_id, constitution_equipe_id)
    VALUES
      ${new Array(nbRows)
        .fill(null)
        .map(
          (_, index) =>
            `($1, (SELECT id FROM front.protocole_sanitaire_constitution_equipe WHERE value = $${index + 2}))`,
        )
        .join(",")}
        `,
  associatePSFiles: `
    INSERT INTO front.org_protocole_sanitaire_files (
      protocole_sanitaire_id, 
      files
      )
    VALUES ($1, $2)
  `,
  associateRAM: (nbRows) => `
  INSERT INTO
    front.ops_to_ram (protocole_sanitaire_id, ps_resp_admin_med_id)
  VALUES
    ${new Array(nbRows)
      .fill(null)
      .map(
        (_, index) =>
          `($1, (SELECT id FROM front.ps_resp_admin_med WHERE value = $${index + 2}))`,
      )
      .join(",")}
      `,
  create: `
      INSERT INTO front.org_protocole_sanitaire (
        organisme_id,
        accord_cabinet_medical,
        conservation_medicament_thermosensible,
        dispositions_specifiques,
        fiche_suivi_medicaments,
        gestion_budget_personnel,
        individualisation_medicaments,
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
        precision_stockage_medicament_securise,
        preparation_pilluliers,
        prescription_medicale_jointe,
        protocole_accident,
        protocole_canicule,
        protocole_evacuation,
        protocole_modification_traitement,
        protocole_reorientation,
        precision_responsable_administration_medicament,
        stockage_medicament_securise,
        trousse_pharmacie
      )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
      RETURNING
        id as "protocoleSanitaireId"
      ;
      `,
  getByOrganismeId: `
    SELECT 
      accord_cabinet_medical AS "accordCabinetMedical",
      conservation_medicament_thermosensible AS "conservationMedicamentThermosensible",
      dispositions_specifiques AS "dispositionsSpecifiques",
      fiche_suivi_medicaments AS "ficheSuiviMedicaments",
      gestion_budget_personnel AS "gestionBudgetPersonnel",
      individualisation_medicaments AS "individualisationMedicaments",
      precision_accord_cabinet_medical AS "precisionAccordCabinetMedical",
      precision_constitution_equipe AS "precisionConstitutionEquipe",
      precision_dispositions_specifiques AS "precisionDispositionsSpecifiques",
      precision_individualisation_medicaments AS "precisionIndividualisationMedicaments",
      precision_preparation_pilluliers AS "precisionPreparationPilluliers",
      precision_protocole_accident AS "precisionProtocoleAccident",
      precision_protocole_canicule AS "precisionProtocoleCanicule",
      precision_protocole_evacuation AS "precisionProtocoleEvacuation",
      precision_protocole_modification_traitement AS "precisionProtocoleModificationTraitement",
      precision_protocole_reorientation AS "precisionProtocoleReorientation",
      precision_stockage_medicament_securise AS "precisionStockageMedicamentSecurise",
      preparation_pilluliers AS "preparationPilluliers",
      prescription_medicale_jointe AS "prescriptionMedicaleJointe",
      protocole_accident AS "protocoleAccident",
      protocole_canicule AS "protocoleCanicule",
      protocole_evacuation AS "protocoleEvacuation",
      protocole_modification_traitement AS "protocoleModificationTraitement",
      protocole_reorientation AS "protocoleReorientation",
      precision_responsable_administration_medicament AS "precisionResponsableAdministrationMedicament",
      stockage_medicament_securise AS "stockageMedicamentSecurise",
      trousse_pharmacie AS "troussePharmacie",
      COALESCE(
        (SELECT JSON_AGG(psce.value)
        FROM front.ops_to_ce pstce
        LEFT JOIN front.protocole_sanitaire_constitution_equipe psce 
          ON pstce.constitution_equipe_id = psce.id
        WHERE pstce.protocole_sanitaire_id = ps.id), '[]'
      ) AS "constitutionEquipe",
      COALESCE(
        (SELECT JSON_AGG(psram.value)
        FROM front.ops_to_ram pstram
        LEFT JOIN front.ps_resp_admin_med psram 
          ON pstram.ps_resp_admin_med_id = psram.id
        WHERE pstram.protocole_sanitaire_id = ps.id), '[]'
      ) AS "responsableAdministrationMedicament"
    FROM front.org_protocole_sanitaire ps
    WHERE organisme_id = $1
  `,
  getIdByOrganiseId: `
    SELECT id
    FROM front.org_protocole_sanitaire
    WHERE organisme_id = $1
  `,
  getPSFiles: `
    SELECT files AS "uuid"
    FROM front.org_protocole_sanitaire_files psf
    INNER JOIN front.org_protocole_sanitaire ps ON ps.organisme_id = $1
    WHERE psf.protocole_sanitaire_id = ps.id
  `,
  removeCE: `
        DELETE FROM front.ops_to_ce
        WHERE
          protocole_sanitaire_id = $1;
      `,
  removePSFiles: `
    DELETE FROM front.org_protocole_sanitaire_files
    WHERE
      protocole_sanitaire_id = $1;
  `,
  removeRAM: `
    DELETE FROM front.ops_to_ram
    WHERE
      protocole_sanitaire_id = $1;
  `,
  update: `
    UPDATE front.org_protocole_sanitaire
    SET
      accord_cabinet_medical = $2,
      conservation_medicament_thermosensible = $3,
      dispositions_specifiques = $4,
      fiche_suivi_medicaments = $5,
      gestion_budget_personnel = $6,
      individualisation_medicaments =$7,
      precision_accord_cabinet_medical = $8,
      precision_constitution_equipe = $9,
      precision_dispositions_specifiques = $10,
      precision_individualisation_medicaments = $11,
      precision_preparation_pilluliers = $12,
      precision_protocole_accident = $13,
      precision_protocole_canicule = $14,
      precision_protocole_evacuation = $15,
      precision_protocole_modification_traitement = $16,
      precision_protocole_reorientation = $17,
      precision_stockage_medicament_securise = $18,
      preparation_pilluliers = $19,
      prescription_medicale_jointe = $20,
      protocole_accident = $21,
      protocole_canicule = $22,
      protocole_evacuation = $23,
      protocole_modification_traitement = $24,
      protocole_reorientation = $25,
      precision_responsable_administration_medicament = $26,
      stockage_medicament_securise = $27,
      trousse_pharmacie = $28
  WHERE
    organisme_id = $1
  `,
};

module.exports.create = async (client, organismeId, parametre) => {
  log.i("create - IN", parametre);

  const response = await client.query(query.create, [
    organismeId,
    parametre.accordCabinetMedical,
    parametre.conservationMedicamentThermosensible,
    parametre.dispositionsSpecifiques,
    parametre.ficheSuiviMedicaments,
    parametre.gestionBudgetPersonnel,
    parametre.individualisationMedicaments,
    parametre.precisionAccordCabinetMedical,
    parametre.precisionConstitutionEquipe,
    parametre.precisionDispositionsSpecifiques,
    parametre.precisionIndividualisationMedicaments,
    parametre.precisionPreparationPilluliers,
    parametre.precisionProtocoleAccident,
    parametre.precisionProtocoleCanicule,
    parametre.precisionProtocoleEvacuation,
    parametre.precisionProtocoleModificationTraitement,
    parametre.precisionProtocoleReorientation,
    parametre.precisionStockageMedicamentSecurise,
    parametre.preparationPilluliers,
    parametre.prescriptionMedicaleJointe,
    parametre.protocoleAccident,
    parametre.protocoleCanicule,
    parametre.protocoleEvacuation,
    parametre.protocoleModificationTraitement,
    parametre.protocoleReorientation,
    parametre.precisionResponsableAdministrationMedicament,
    parametre.stockageMedicamentSecurise,
    parametre.troussePharmacie,
  ]);
  log.d("create - DONE");
  return response.rows[0].protocoleSanitaireId;
};

module.exports.createOrUpdate = async (client, organismeId, parametre) => {
  log.i("update - IN");

  const { rows: protocoleSanitaire, rowCount } = await client.query(
    query.getIdByOrganiseId,
    [organismeId],
  );

  const protocoleSanitaireId =
    rowCount === 0
      ? await create(client, organismeId, parametre)
      : protocoleSanitaire[0].id;

  await client.query(query.update, [
    organismeId,
    parametre?.accordCabinetMedical ?? null,
    parametre?.conservationMedicamentThermosensible ?? null,
    parametre?.dispositionsSpecifiques ?? null,
    parametre?.ficheSuiviMedicaments ?? null,
    parametre?.gestionBudgetPersonnel ?? null,
    parametre?.individualisationMedicaments ?? null,
    parametre?.precisionAccordCabinetMedical ?? null,
    parametre?.precisionConstitutionEquipe ?? null,
    parametre?.precisionDispositionsSpecifiques ?? null,
    parametre?.precisionIndividualisationMedicaments ?? null,
    parametre?.precisionPreparationPilluliers ?? null,
    parametre?.precisionProtocoleAccident ?? null,
    parametre?.precisionProtocoleCanicule ?? null,
    parametre?.precisionProtocoleEvacuation ?? null,
    parametre?.precisionProtocoleModificationTraitement ?? null,
    parametre?.precisionProtocoleReorientation ?? null,
    parametre?.precisionStockageMedicamentSecurise ?? null,
    parametre?.preparationPilluliers ?? null,
    parametre?.prescriptionMedicaleJointe ?? null,
    parametre?.protocoleAccident ?? null,
    parametre?.protocoleCanicule ?? null,
    parametre?.protocoleEvacuation ?? null,
    parametre?.protocoleModificationTraitement ?? null,
    parametre?.protocoleReorientation ?? null,
    parametre?.precisionResponsableAdministrationMedicament ?? null,
    parametre?.stockageMedicamentSecurise ?? null,
    parametre?.troussePharmacie ?? null,
  ]);

  await client.query(query.removeRAM, [protocoleSanitaireId]);

  const responsableAdministrationMedicament =
    parametre.responsableAdministrationMedicament ?? null;
  if (responsableAdministrationMedicament?.length > 0) {
    await client.query(
      query.associateRAM(responsableAdministrationMedicament.length),
      [protocoleSanitaireId, ...responsableAdministrationMedicament],
    );
  }

  await client.query(query.removeCE, [protocoleSanitaireId]);
  const constitutionEquipe = parametre.constitutionEquipe ?? null;
  if (constitutionEquipe?.length > 0) {
    await client.query(query.associateCE(constitutionEquipe.length), [
      protocoleSanitaireId,
      ...constitutionEquipe,
    ]);
  }

  await client.query(query.removePSFiles, [protocoleSanitaireId]);

  const psFiles = parametre.files;

  await psFiles.forEach((psFile) => {
    client.query(query.associatePSFiles, [
      protocoleSanitaireId,
      psFile?.uuid ?? null,
    ]);
  });

  log.i("update - DONE");
};

module.exports.getByOrganismeId = async (organismeId) => {
  log.i("getByOrganismeId - IN", organismeId);
  const { rowCount, rows: protocoleSanitaire } = await pool.query(
    query.getByOrganismeId,
    [organismeId],
  );
  const { rows: uuids } = await pool.query(query.getPSFiles, [organismeId]);
  const files = await Promise.all(
    uuids.map(({ uuid }) => getFileMetaData(uuid) ?? null),
  );
  log.i("getByOrganismeId - DONE");
  return rowCount === 0 ? {} : { ...protocoleSanitaire[0], files };
};

const { create } = module.exports;
