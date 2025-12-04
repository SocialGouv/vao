const logger = require("../../utils/logger");
const { getPool } = require("../../utils/pgpool");

const log = logger(module.filename);

const { addHistoric } = require("../Tracking");
const {
  TRACKING_ACTIONS,
  TRACKING_ENTITIES,
  TRACKING_USER_TYPE,
} = require("@vao/shared-bridge");

const query = {
  associateRepresentantsLegaux: (valueParams) => `
    INSERT INTO front.opm_representants_legaux (
      personne_morale_id,
      prenom,
      nom,
      fonction
      )
    VALUES ${valueParams}
  `,
  changeCurrent: `
    UPDATE front.personne_morale
    SET
      current = false,
      edited_at = NOW()
    WHERE
      id = $1;
  `,
  create: `
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
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31)
    RETURNING
      id as "personneMoraleId"
    ;
    `,
  getByOrganismeId: `
    SELECT id AS "id",
      pays AS "pays",
      email AS "email",
      siren AS "siren",
      siret AS "siret",
      statut AS "statut",
      adresse AS "adresse",
      telephone AS "telephone",
      siege_social AS "siegeSocial",
      nom_commercial AS "nomCommercial",
      raison_sociale AS "raisonSociale",
      porteur_agrement AS "porteurAgrement",
      COALESCE(
        (SELECT JSON_AGG(
          JSON_BUILD_OBJECT(
            'nic', nic,
            'siret', siret,
            'adresse', adresse,
            'commune', commune,
            'enabled', enabled,
            'codePostal', code_postal,
            'denomination', denomination,
            'etatAdministratif', etat_administratif
          )
        ) 
        FROM front.opm_etablissements opmetab
        WHERE opmetab.personne_morale_id = pm.id), '[]'
      ) AS etablissements,
      COALESCE(
        (SELECT JSON_AGG(
          JSON_BUILD_OBJECT(
            'nom', nom,
            'prenom', prenom,
            'fonction', fonction
          )
        ) 
        FROM front.opm_representants_legaux oprepleg
        WHERE oprepleg.personne_morale_id = pm.id AND pm.current = true), '[]'
      ) AS 
       "representantsLegaux",
       COALESCE(
        (SELECT
          JSON_BUILD_OBJECT(
            'siret', siret,
            'adresse', adresse,
            'telephone', telephone,
            'nomCommercial', nom_commercial,
            'raisonSociale', raison_sociale,
            'pays', pays,
            'email', email
          )
        FROM front.personne_morale pm_siege
        WHERE pm.siren = pm_siege.siren AND pm_siege.current = true AND pm_siege.siege_social = true), '{}'
      ) AS 
       "etablissementPrincipal",
      JSON_BUILD_OBJECT(
          'nom', resp_sejour_nom,
          'prenom', resp_sejour_prenom,
          'email', resp_sejour_email,
          'adresse', JSON_BUILD_OBJECT(
            'label', resp_sejour_adresse_label,
            'cleInsee', resp_sejour_adresse_cle_insee,
            'codeInsee', resp_sejour_adresse_code_insee,
            'codePostal', resp_sejour_adresse_code_postal,
            'long', resp_sejour_adresse_long,
            'lat', resp_sejour_adresse_lat,
            'departement', resp_sejour_adresse_departement
          ),
          'fonction', resp_sejour_fonction,
          'telephone', resp_sejour_telephone
      ) AS "responsableSejour"
    FROM front.personne_morale pm
    WHERE organisme_id = $1 AND current = TRUE;
  `,
  getIdByOrganiseId: `
    SELECT *
    FROM front.personne_morale
    WHERE organisme_id = $1 AND current = TRUE;
  `,
  removeRepresentantsLegaux: `
    DELETE FROM front.opm_representants_legaux
    WHERE
      personne_morale_id = $1;
  `,
  update: `
    UPDATE front.personne_morale
    SET
      pays = $2,
      email = $3,
      siren = $4,
      siret = $5,
      statut = $6,
      adresse = $7,
      telephone = $8,
      siege_social = $9,
      nom_commercial = $10,
      raison_sociale = $11,
      porteur_agrement = $12,
      resp_sejour_nom = $13,
      resp_sejour_prenom = $14,
      resp_sejour_email = $15,
      resp_sejour_adresse_label = $16,
      resp_sejour_adresse_cle_insee = $17,
      resp_sejour_adresse_code_insee = $18,
      resp_sejour_adresse_code_postal = $19,
      resp_sejour_adresse_long = $20,
      resp_sejour_adresse_lat = $21,
      resp_sejour_adresse_departement = $22,
      resp_sejour_fonction = $23,
      resp_sejour_telephone = $24,
      etab_principal_siret = $25,
      etab_principal_adresse = $26,
      etab_principal_telephone = $27,
      etab_principal_nom_commercial = $28,
      etab_principal_raison_sociale = $29,
      etab_principal_pays = $30,
      etab_principal_email = $31
  WHERE
    organisme_id = $1 and current = TRUE
  `,
};

module.exports.create = async (client, organismeId, parametre, userId) => {
  log.i("create - IN", parametre);

  const response = await client.query(query.create, [
    organismeId,
    parametre?.pays ?? null,
    parametre?.email ?? null,
    parametre?.siren ?? null,
    parametre?.siret ?? null,
    parametre?.statut ?? null,
    parametre?.adresse ?? null,
    parametre?.telephone ?? null,
    parametre?.siegeSocial ?? null,
    parametre?.nomCommercial ?? null,
    parametre?.raisonSociale ?? null,
    parametre?.porteurAgrement ?? null,
    parametre?.responsableSejour?.nom ?? null,
    parametre?.responsableSejour?.prenom ?? null,
    parametre?.responsableSejour?.email ?? null,
    parametre?.responsableSejour?.adresse?.label ?? null,
    parametre?.responsableSejour?.adresse?.cleInsee ?? null,
    parametre?.responsableSejour?.adresse?.codeInsee ?? null,
    parametre?.responsableSejour?.adresse?.codePostal ?? null,
    parametre?.responsableSejour?.adresse?.coordinates?.[0] ?? null,
    parametre?.responsableSejour?.adresse?.coordinates?.[1] ?? null,
    parametre?.responsableSejour?.adresse?.departement ?? null,
    parametre?.responsableSejour?.fonction ?? null,
    parametre?.responsableSejour?.telephone ?? null,
    parametre?.etablissementPrincipal?.siret ?? null,
    parametre?.etablissementPrincipal?.adresse ?? null,
    parametre?.etablissementPrincipal?.telephone ?? null,
    parametre?.etablissementPrincipal?.nomCommercial ?? null,
    parametre?.etablissementPrincipal?.raisonSociale ?? null,
    parametre?.etablissementPrincipal?.pays ?? null,
    parametre?.etablissementPrincipal?.email ?? null,
  ]);

  addHistoric({
    action: TRACKING_ACTIONS.creation,
    data: { newData: { ...parametre, organismeId } },
    entity: TRACKING_ENTITIES.personneMorale,
    entityId: response.rows[0].personneMoraleId,
    userId: userId,
    userType: TRACKING_USER_TYPE.front,
  });
  log.d("create - DONE");
  return response.rows[0].personneMoraleId;
};

module.exports.createOrUpdate = async (
  client,
  organismeId,
  parametre,
  userId,
) => {
  log.i("createOrUpdate - IN");
  const { rows: personneMorale, rowCount } = await client.query(
    query.getIdByOrganiseId,
    [organismeId],
  );
  let personneMoraleId;
  if (rowCount === 0 || parametre?.siret !== personneMorale[0]?.siret) {
    if (rowCount !== 0) {
      await client.query(query.changeCurrent, [personneMorale[0].id]);
      addHistoric({
        action: TRACKING_ACTIONS.deletion,
        data: { newData: parametre, oldData: personneMorale[0] },
        entity: TRACKING_ENTITIES.personneMorale,
        entityId: personneMorale[0].id,
        userId: userId,
        userType: TRACKING_USER_TYPE.front,
      });
    }

    personneMoraleId = await create(client, organismeId, parametre, userId);
  } else {
    personneMoraleId = personneMorale[0].id;
  }
  await client.query(query.update, [
    organismeId,
    parametre?.pays ?? null,
    parametre?.email ?? null,
    parametre?.siren ?? null,
    parametre?.siret ?? null,
    parametre?.statut ?? null,
    parametre?.adresse ?? null,
    parametre?.telephone ?? null,
    parametre?.siegeSocial ?? null,
    parametre?.nomCommercial ?? null,
    parametre?.raisonSociale ?? null,
    parametre?.porteurAgrement ?? null,
    parametre?.responsableSejour?.nom ?? null,
    parametre?.responsableSejour?.prenom ?? null,
    parametre?.responsableSejour?.email ?? null,
    parametre?.responsableSejour?.adresse?.label ?? null,
    parametre?.responsableSejour?.adresse?.cleInsee ?? null,
    parametre?.responsableSejour?.adresse?.codeInsee ?? null,
    parametre?.responsableSejour?.adresse?.codePostal ?? null,
    parametre?.responsableSejour?.adresse?.coordinates?.[0] ?? null,
    parametre?.responsableSejour?.adresse?.coordinates?.[1] ?? null,
    parametre?.responsableSejour?.adresse?.departement ?? null,
    parametre?.responsableSejour?.fonction ?? null,
    parametre?.responsableSejour?.telephone ?? null,
    parametre?.etablissementPrincipal?.siret ?? null,
    parametre?.etablissementPrincipal?.adresse ?? null,
    parametre?.etablissementPrincipal?.telephone ?? null,
    parametre?.etablissementPrincipal?.nomCommercial ?? null,
    parametre?.etablissementPrincipal?.raisonSociale ?? null,
    parametre?.etablissementPrincipal?.pays ?? null,
    parametre?.etablissementPrincipal?.email ?? null,
  ]);
  addHistoric({
    action: TRACKING_ACTIONS.modification,
    data: { newData: parametre, oldData: personneMorale[0] },
    entity: TRACKING_ENTITIES.personneMorale,
    entityId: personneMorale[0].id,
    userId: userId,
    userType: TRACKING_USER_TYPE.front,
  });
  await client.query(query.removeRepresentantsLegaux, [personneMoraleId]);
  const representantsLegaux = parametre.representantsLegaux;
  if (representantsLegaux && Object.keys(representantsLegaux).length !== 0) {
    const valuesRepreLegaux = representantsLegaux.flatMap(
      (representantLegal) => [
        personneMoraleId,
        representantLegal?.nom,
        representantLegal?.prenom,
        representantLegal?.fonction,
      ],
    );

    const valuesParamsRepLegaux = representantsLegaux
      .map(
        (_, index) =>
          `($${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}, $${index * 4 + 4})`,
      )
      .join(", ");
    await client.query(
      query.associateRepresentantsLegaux(valuesParamsRepLegaux),
      valuesRepreLegaux,
    );
  }
  log.i("createOrUpdate - DONE");
  return personneMoraleId;
};

module.exports.getByOrganismeId = async (organismeId) => {
  log.i("getByOrganismeId - IN", organismeId);
  const { rowCount, rows: personneMorales } = await getPool().query(
    query.getByOrganismeId,
    [organismeId],
  );

  return rowCount === 0 ? {} : personneMorales[0];
};

module.exports.getIdByOrganismeId = async (organismeId) => {
  log.i("getIdByOrganismeId - IN", organismeId);
  const { rows: personneMorale, rowCount } = await getPool().query(
    query.getIdByOrganiseId,
    [organismeId],
  );
  log.i("getIdByOrganismeId - DONE");
  return rowCount === 0 ? {} : { id: personneMorale[0].id };
};

const { create } = module.exports;
