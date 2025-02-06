const logger = require("../../utils/logger");

const log = logger(module.filename);

const query = {
  associateEtablissement: (valueParams) => `
    INSERT INTO front.opm_etablissements (
        personne_morale_id,
        nic,
        siret,
        adresse,
        commune,
        enabled,
        code_postal,
        denomination,
        etat_administratif
      )
      VALUES ${valueParams}
  `,
  getPersonneMoraleId: `
  SELECT
    id AS "personneMoraleId"
  FROM
    front.personne_morale
  WHERE
    organisme_id = $1;
  `,
  removeEtablissements: `
    DELETE FROM front.opm_etablissements
    WHERE
      personne_morale_id = $1;
  `,
};

module.exports.createOrUpdate = async (client, organismeId, parametre) => {
  log.i("createOrUpdate - IN");

  await client.query("BEGIN");

  const { rows } = await client.query(query.getPersonneMoraleId, [organismeId]);

  const personneMoraleId = rows[0].personneMoraleId;

  await client.query(query.removeEtablissements, [personneMoraleId]);
  const etablissements = parametre.etablissements;
  if (etablissements && Object.keys(etablissements).length !== 0) {
    const valuesEtablissement = etablissements.flatMap((etablissement) => [
      personneMoraleId,
      etablissement?.nic ?? null,
      etablissement?.siret ?? null,
      etablissement?.adresse ?? null,
      etablissement?.commune ?? null,
      etablissement?.enabled ?? null,
      etablissement?.codePostal ?? null,
      etablissement?.denomination ?? null,
      etablissement?.etatAdministratif ?? null,
    ]);

    const valuesParamsEtab = etablissements
      .map(
        (_, index) =>
          `($${index * 9 + 1}, $${index * 9 + 2}, $${index * 9 + 3}, $${index * 9 + 4}, $${index * 9 + 5}, $${index * 9 + 6}, $${index * 9 + 7}, $${index * 9 + 8}, $${index * 9 + 9})`,
      )
      .join(", ");

    await client.query(
      query.associateEtablissement(valuesParamsEtab),
      valuesEtablissement,
    );
  }

  log.i("createOrUpdate - DONE");
};
