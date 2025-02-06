const logger = require("../../utils/logger");

const log = logger(module.filename);

const query = {
  create: `
    INSERT INTO front.personne_physique (
      organisme_id,
      prenom,
      nom_usage,
      nom_naissance,
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
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
    RETURNING
      id as "personnePhysiqueId"
    ;
    `,
  getIdByOrganiseId: `
    SELECT id
    FROM front.personne_physique
    WHERE organisme_id = $1
  `,

  update: `
    UPDATE front.personne_physique
    SET
      prenom = $2,
      nom_usage = $3,
      nom_naissance = $4,
      telephone = $5,
      profession = $6,
      adresse_siege_label = $7,
      adresse_siege_cle_insee = $8,
      adresse_siege_code_insee = $9,
      adresse_siege_code_postal = $10,
      adresse_siege_long = $11,
      adresse_siege_lat = $12,
      adresse_siege_departement = $13,
      adresse_domicile_label = $14,
      adresse_domicile_cle_insee = $15,
      adresse_domicile_code_insee = $16,
      adresse_domicile_code_postal = $17,
      adresse_domicile_long = $18,
      adresse_domicile_lat = $19,
      adresse_domicile_departement = $20,
      adresse_identique = $21
  WHERE
    organisme_id = $1
  `,
};

module.exports.create = async (client, organismeId, parametre) => {
  log.i("create - IN", parametre);

  const response = await client.query(query.create, [
    organismeId,
    parametre?.prenom ?? null,
    parametre?.nomUsage ?? null,
    parametre?.nomNaissance ?? null,
    parametre?.telephone ?? null,
    parametre?.profession ?? null,
    parametre?.adresseSiege?.label ?? null,
    parametre?.adresseSiege?.cleInsee ?? null,
    parametre?.adresseSiege?.codeInsee ?? null,
    parametre?.adresseSiege?.codePostal ?? null,
    parametre?.adresseSiege?.coordinates[0] ?? null,
    parametre?.adresseSiege?.coordinates[1] ?? null,
    parametre?.adresseSiege?.departement ?? null,
    parametre?.adresseDomicile?.label ?? null,
    parametre?.adresseDomicile?.cleInsee ?? null,
    parametre?.adresseDomicile?.codeInsee ?? null,
    parametre?.adresseDomicile?.codePostal ?? null,
    parametre?.adresseDomicile?.coordinates[0] ?? null,
    parametre?.adresseDomicile?.coordinates[1] ?? null,
    parametre?.adresseDomicile?.departement ?? null,
    parametre?.adresseIdentique ?? null,
  ]);

  log.d("create - DONE");
  return response.rows[0];
};

module.exports.createOrUpdate = async (client, organismeId, parametre) => {
  log.i("createOrUpdate - IN");
  if (Object.keys(parametre).length === 0) {
    return null;
  }
  const { rowCount } = await client.query(query.getIdByOrganiseId, [
    organismeId,
  ]);
  rowCount === 0
    ? await create(client, organismeId, parametre)
    : await client.query(query.update, [
        organismeId,
        parametre?.prenom ?? null,
        parametre?.nomUsage ?? null,
        parametre?.nomNaissance ?? null,
        parametre?.telephone ?? null,
        parametre?.profession ?? null,
        parametre?.adresseSiege?.label ?? null,
        parametre?.adresseSiege?.cleInsee ?? null,
        parametre?.adresseSiege?.codeInsee ?? null,
        parametre?.adresseSiege?.codePostal ?? null,
        parametre?.adresseSiege?.coordinates?.[0] ?? null,
        parametre?.adresseSiege?.coordinates?.[1] ?? null,
        parametre?.adresseSiege?.departement ?? null,
        parametre?.adresseDomicile?.label ?? null,
        parametre?.adresseDomicile?.cleInsee ?? null,
        parametre?.adresseDomicile?.codeInsee ?? null,
        parametre?.adresseDomicile?.codePostal ?? null,
        parametre?.adresseDomicile?.coordinates?.[0] ?? null,
        parametre?.adresseDomicile?.coordinates?.[1] ?? null,
        parametre?.adresseDomicile?.departement ?? null,
        parametre?.adresseIdentique ?? null,
      ]);

  log.i("createOrUpdate - DONE");
};

const { create } = module.exports;
