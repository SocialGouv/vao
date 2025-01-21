const logger = require("../../utils/logger");

const pool = require("../../utils/pgpool").getPool();

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
        files,
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
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)
      RETURNING
        id as "protocoleSanitaireId"
      ;
      `,
  getIdByOrganiseId: `
    SELECT id
    FROM front.org_protocole_sanitaire
    WHERE organisme_id = $1
  `,
  removeCE: `
        DELETE FROM front.ops_to_ce
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
      files = $6,
      gestion_budget_personnel = $7,
      individualisation_medicaments =$8,
      precision_accord_cabinet_medical = $9,
      precision_constitution_equipe = $10,
      precision_dispositions_specifiques = $11,
      precision_individualisation_medicaments = $12,
      precision_preparation_pilluliers = $13,
      precision_protocole_accident = $14,
      precision_protocole_canicule = $15,
      precision_protocole_evacuation = $16,
      precision_protocole_modification_traitement = $17,
      precision_protocole_reorientation = $18,
      precision_stockage_medicament_securise = $19,
      preparation_pilluliers = $20,
      prescription_medicale_jointe = $21,
      protocole_accident = $22,
      protocole_canicule = $23,
      protocole_evacuation = $24,
      protocole_modification_traitement = $25,
      protocole_reorientation = $26,
      precision_responsable_administration_medicament = $27,
      stockage_medicament_securise = $28,
      trousse_pharmacie = $29
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
    parametre.files[0]?.uuid ?? null,
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

module.exports.createOrUpdate = async (organismeId, parametre) => {
  log.i("update - IN");

  const { rows: protocoleSanitaire, rowCount } = await pool.query(
    query.getIdByOrganiseId,
    [organismeId],
  );
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

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
      parametre?.files[0]?.uuid ?? null,
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

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  log.i("update - DONE");
};

const { create } = module.exports;
