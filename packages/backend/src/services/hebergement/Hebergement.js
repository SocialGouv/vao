/* eslint-disable no-param-reassign */
const logger = require("../../utils/logger");
const {
  saveAdresse,
  getById: getAdressById,
  getByIds: getAdressByIds,
} = require("../adresse");
const {
  queryGetFields,
  mapDBHebergement,
  mapDBHebergementToDSHebergement,
} = require("./helpers");
const pool = require("../../utils/pgpool").getPool();

const log = logger(module.filename);

const query = {
  associatePrestation: (nbRows) => `
INSERT INTO
  FRONT.HEBERGEMENT_TO_PRESTATIONS_HOTELIERES (HEBERGEMENT_ID, PRESTATION_ID)
VALUES
${new Array(nbRows)
  .fill(null)
  .map(
    (_, index) =>
      `($1, (SELECT ID FROM FRONT.HEBERGEMENT_PRESTATIONS_HOTELIERES WHERE VALUE = $${index + 2}))`,
  )
  .join(",")}
  `,
  create: `
    INSERT INTO front.hebergement(
      organisme_id,
      CREATED_BY,
      EDITED_BY,
      created_at,
      edited_at,
      HEBERGEMENT_ID,
      CURRENT,
      nom,
      coordonnees,
      informations_locaux,
      informations_transport,
      EMAIL,
      ADRESSE_ID,
      TELEPHONE_1,
      TELEPHONE_2,
      NOM_GESTIONNAIRE,
      TYPE_ID,
      TYPE_PENSION_ID,
      NOMBRE_LITS,
      LIT_DESSUS,
      NOMBRE_LITS_SUPERPOSES,
      NOMBRE_MAX_PERSONNES_COUCHAGE,
      VISITE_LOCAUX,
      ACCESSIBILITE_ID,
      CHAMBRES_DOUBLES,
      CHAMBRES_UNISEXES,
      REGLEMENTATION_ERP,
      COUCHAGE_INDIVIDUEL,
      RANGEMENT_INDIVIDUEL,
      AMENAGEMENTS_SPECIFIQUES,
      DESCRIPTION_LIEU_HEBERGEMENT,
      EXCURSION_DESCRIPTION,
      DEPLACEMENT_PROXIMITE_DESCRIPTION,
      VEHICULES_ADAPTES,
      FILE_REPONSE_EXPLOITANT_OU_PROPRIETAIRE,
      FILE_DERNIER_ARRETE_AUTORISATION_MAIRE,
      FILE_DERNIERE_ATTESTATION_SECURITE,
      VISITE_LOCAUX_AT,
      ACCESSIBILITE_PRECISION,
      AMENAGEMENTS_SPECIFIQUES_PRECISION
    )
    VALUES (
      $1,                                                               --organisme_id,
      $2,                                                               --CREATED_BY,
      $3,                                                               --EDITED_BY,
      $4,                                                               --created_at,
      NOW(),                                                            --edited_at,
      $5,                                                                --HEBERGEMENT_ID,
      TRUE,                                                             --CURRENT,
      $6,                                                               --nom,
      $7,                                                               --coordonnees,
      $8,                                                               --informations_locaux,
      $9,                                                               --informations_transport,
      $10,                                                               --EMAIL,
      $11,                                                               --ADRESSE_ID,
      $12,                                                               --TELEPHONE_1,
      $13,                                                               --TELEPHONE_2,
      $14,                                                              --NOM_GESTIONNAIRE,
      (SELECT ID FROM FRONT.HEBERGEMENT_TYPE WHERE VALUE = $15),          --TYPE_ID,
      (SELECT ID FROM FRONT.HEBERGEMENT_TYPE_PENSION WHERE VALUE = $16),  --TYPE_PENSION_ID,
      $17,                                                              --NOMBRE_LITS,
      $18,                                                              --LIT_DESSUS,
      $19,                                                              --NOMBRE_LITS_SUPERPOSES,
      $20,                                                              --NOMBRE_MAX_PERSONNES_COUCHAGE,
      $21,                                                              --VISITE_LOCAUX,
      (SELECT ID FROM FRONT.HEBERGEMENT_ACCESSIBILITE WHERE VALUE = $22), --ACCESSIBILITE_ID,
      $23,                                                              --CHAMBRES_DOUBLES,
      $24,                                                              --CHAMBRES_UNISEXES,
      $25,                                                              --REGLEMENTATION_ERP,
      $26,                                                              --COUCHAGE_INDIVIDUEL,
      $27,                                                              --RANGEMENT_INDIVIDUEL,
      $28,                                                              --AMENAGEMENTS_SPECIFIQUES,
      $29,                                                              --DESCRIPTION_LIEU_HEBERGEMENT,
      $30,                                                              --EXCURSION_DESCRIPTION,
      $31,                                                              --DEPLACEMENT_PROXIMITE_DESCRIPTION,
      $32,                                                              --VEHICULES_ADAPTES,
      $33,                                                              --FILE_REPONSE_EXPLOITANT_OU_PROPRIETAIRE,
      $34,                                                              --FILE_DERNIER_ARRETE_AUTORISATION_MAIRE,
      $35,                                                              --FILE_DERNIERE_ATTESTATION_SECURITE
      $36,                                                              --VISITE_LOCAUX_AT
      $37,                                                              --ACCESSIBILITE_PRECISION
      $38                                                               --AMENAGEMENTS_SPECIFIQUES_PRECISION
    )
    RETURNING id
    `,
  getByDSId: `
    SELECT
        ID as "hebergementId",
        NOM,
        DSTH.DATE_DEBUT as "dateDebut",
        DSTH.DATE_FIN as "dateFin",
        ${queryGetFields}
    FROM
        FRONT.HEBERGEMENT H
        INNER JOIN FRONT.DEMANDE_SEJOUR_TO_HEBERGEMENT DSTH ON DSTH.HEBERGEMENT_ID = H.ID
        AND DSTH.DEMANDE_SEJOUR_ID = $1 ;
    `,
  getByDepartementCodes: (
    departementCodes,
    { search, limit, offset, order, sort },
  ) => [
    `
    WITH filtered_hebergements AS (
      SELECT
        H.ID AS "id",
        A.DEPARTEMENT AS "departement",
        H.EMAIL AS EMAIL,
        H.TELEPHONE_1 AS TELEPHONE,
        H.NOM_GESTIONNAIRE AS "nomGestionnaire",
        A.LABEL AS ADRESSE,
        H.NOM AS "nom",
        ( SELECT VALUE FROM FRONT.HEBERGEMENT_TYPE WHERE ID = H.ID) AS "typeHebergement",
        H.VISITE_LOCAUX_AT AS "dateVisite",
        H.REGLEMENTATION_ERP AS "reglementationErp"
      FROM
        FRONT.HEBERGEMENT H
        LEFT JOIN FRONT.ADRESSE A ON A.ID = H.ADRESSE_ID
      WHERE
        A.DEPARTEMENT = ANY($1)
        AND (
          unaccent(h.nom) ILIKE '%' || unaccent($2) || '%'
          OR h.email ILIKE '%' || $2 || '%'
          OR unaccent(a.label) ILIKE '%' || unaccent($2) || '%'
        )
        AND CURRENT IS TRUE
      ORDER BY "${sort}" ${order}
    ),
    total_count AS (
      SELECT COUNT(*) AS count FROM filtered_hebergements
    ),
    paged_hebergements AS (
      SELECT * FROM filtered_hebergements
      LIMIT $3 OFFSET $4
    )
    SELECT
    jsonb_build_object(
      'total_count', (SELECT count FROM total_count),
      'hebergements', jsonb_agg(ph.*)
    ) AS data
  FROM paged_hebergements AS ph;
    `,
    [departementCodes, search, limit, offset],
  ],
  getById: `
    SELECT
      id,
      nom,
      ${queryGetFields}
    FROM front.hebergement h
    WHERE id = $1
    `,
  getByIdAndMySiren: `
    SELECT distinct(h.id)
      FROM
      front.hebergement h
      JOIN front.user_organisme uo ON uo.org_id = h.organisme_id
      JOIN front.organismes o ON o.id = uo.org_id
      WHERE h.id = $1
      AND (uo.use_id = $2 OR o.personne_morale->>'siren' = $3)
  `,
  getBySiren: `
    SELECT
      h.id,
      h.nom,
      a.departement as departement,
      a.label as adresse,
      h.supprime,
      h.created_at as "createdAt",
      h.edited_at as "editedAt"
    FROM front.hebergement h
    JOIN front.organismes o ON h.organisme_id = o.id
    LEFT JOIN front.adresse a on a.id = h.adresse_id
    WHERE o.personne_morale->>'siren' = $1
    `,
  getByUserId: `
    SELECT
      h.id as "id",
      nom as "nom",
      a.label as "adresse",
      a.departement as "departement"
    FROM front.hebergement h
    LEFT JOIN front.user_organisme uo ON uo.org_id = h.organisme_id
    LEFT JOIN front.adresse a ON a.id = h.adresse_id
    WHERE uo.use_id = $1
      AND CURRENT IS TRUE
    `,
  getPreviousValueForHistory: `
  SELECT
    HEBERGEMENT_ID AS "hebergementUuid",
    ORGANISME_ID as "organismeId",
    CREATED_BY as "createdBy",
    CREATED_AT as "createdAt",
    CURRENT as "current"
  FROM
    FRONT.HEBERGEMENT
  WHERE
    ID = $1;
  `,
  historize: `
    UPDATE front.hebergement
    SET current = FALSE
    WHERE id = $1
  `,
  update: `
    UPDATE front.hebergement
    SET
      nom = $2,
      coordonnees = $3,
      informations_locaux = $4,
      informations_transport = $5,
      edited_at = NOW()
    WHERE id = $1
  `,
};

/*
* La fonction create est utilisée à la fois pour créer un nouvel hébergement et pour mettre à jour un
* hébergement existant. Dans le cas d'une mise à jour, elle archive l'hébergement précédent en définissant
* le champ current à false, puis insère une nouvelle ligne pour l'hébergement mis à jour.

* Pour garantir l'intégrité des données lors de ces opérations, qui impliquent plusieurs interactions avec la base
* de données, celles-ci sont exécutées dans le cadre d'une transaction. La fonction prend donc en paramètre le client
* de transaction fourni par pg (node-postgres).
*
* Les transactions doivent être écrites dans les fonctions appelantes.

* Pour plus d'informations, consultez la documentation sur les transactions de
* node-postgres : https://node-postgres.com/features/transactions.
*/
const create = async (
  client,
  { createdBy, createdAt, updatedBy, organismeId },
  { nom, coordonnees, informationsLocaux, informationsTransport },
  hebergemenetUuid,
) => {
  const adresseId = await saveAdresse(client, coordonnees.adresse);
  const { rows } = await client.query(query.create, [
    organismeId, // $1
    createdBy,
    updatedBy,
    createdAt,
    hebergemenetUuid ?? crypto.randomUUID(), // 5
    nom,
    coordonnees,
    informationsLocaux,
    informationsTransport,
    coordonnees.email, // 10
    adresseId,
    coordonnees.numTelephone1,
    coordonnees.numTelephone2,
    coordonnees.nomGestionnaire,
    informationsLocaux.type, // 15
    informationsLocaux.pension,
    informationsLocaux.nombreLits,
    informationsLocaux.litsDessus,
    informationsLocaux.nombreLitsSuperposes,
    informationsLocaux.nombreMaxPersonnesCouchage, // 20
    informationsLocaux.visiteLocaux,
    informationsLocaux.accessibilite,
    informationsLocaux.chambresDoubles,
    informationsLocaux.chambresUnisexes,
    informationsLocaux.reglementationErp, // 25
    informationsLocaux.couchageIndividuel,
    informationsLocaux.rangementIndividuel,
    informationsLocaux.amenagementsSpecifiques,
    informationsLocaux.descriptionLieuHebergement,
    informationsTransport.excursion, // 30
    informationsTransport.deplacementProximite,
    informationsTransport.vehiculesAdaptes,
    informationsLocaux.fileReponseExploitantOuProprietaire?.uuid ?? null,
    informationsLocaux.fileDernierArreteAutorisationMaire?.uuid ?? null,
    informationsLocaux.fileDerniereAttestationSecurite?.uuid ?? null,
    informationsLocaux.visiteLocauxAt,
    informationsLocaux.accessibilitePrecision,
    informationsLocaux.precisionAmenagementsSpecifiques,
  ]);

  const hebergementId = rows[0].id;
  const prestationsHotelieres = informationsLocaux.prestationsHotelieres;
  if (prestationsHotelieres.length > 0) {
    await client.query(
      query.associatePrestation(prestationsHotelieres.length),
      [hebergementId, ...prestationsHotelieres],
    );
  }

  return hebergementId;
};

module.exports.create = async (userId, organismeId, hebergement) => {
  const client = await pool.connect();
  let hebergementId;

  try {
    await client.query("BEGIN");
    hebergementId = await create(
      client,
      {
        createdAt: new Date(),
        createdBy: userId,
        organismeId,
        updatedBy: userId,
      },
      hebergement,
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  return hebergementId;
};

module.exports.update = async (userId, hebergementId, hebergement) => {
  const {
    rows: [{ hebergementUuid, organismeId, createdBy, createdAt, current }],
  } = await pool.query(query.getPreviousValueForHistory, [hebergementId]);
  const client = await pool.connect();

  if (!current) {
    throw new Error("L'hebergement est archivé et ne peux pas etre modifié", {
      cause: "archive",
    });
  }

  let newHebergementId;
  try {
    await client.query("BEGIN");
    await client.query(query.historize, [hebergementId]);
    newHebergementId = await create(
      client,
      {
        createdAt,
        createdBy,
        organismeId,
        updatedBy: userId,
      },
      hebergement,
      hebergementUuid,
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  return newHebergementId;
};

module.exports.getByDepartementCodes = async (departementsCodes, params) => {
  log.i("getByDepartementCodes - IN");
  const { rows } = await pool.query(
    ...query.getByDepartementCodes(departementsCodes, params),
  );
  log.d("getByDepartementCodes - DONE");
  return rows[0];
};

module.exports.getByUserId = async (userId) => {
  log.i("getByUserId - IN", { userId });
  const response = await pool.query(query.getByUserId, [userId]);
  log.d("getByUserId - DONE");
  const hebergements = response.rows;
  return hebergements;
};

module.exports.getBySiren = async (siren) => {
  log.i("getBySiren - IN", { siren });
  const response = await pool.query(query.getBySiren, [siren]);
  log.d("getBySiren - DONE");
  return response.rows;
};

module.exports.getByIdAndMySiren = async (id, userId, siren) => {
  log.i("getByIdAndSiren - IN");
  const response = await pool.query(query.getByIdAndMySiren, [
    id,
    userId,
    siren,
  ]);
  log.d("getByIdAndSiren - DONE");
  return response.rows;
};

module.exports.getById = async (id) => {
  log.i("getById - IN", { id });
  const { rows: hebergements, rowCount } = await pool.query(query.getById, [
    id,
  ]);

  if (rowCount === 0) {
    return null;
  }
  const hebergement = hebergements[0];
  const adresse = await getAdressById(hebergement.adresseId);

  log.d("getById - DONE");
  return await mapDBHebergement(hebergement, adresse);
};

module.exports.getByDSId = async (dsId) => {
  log.i("getByDSId - IN", { dsId });
  const { rows: hebergements, rowCount } = await pool.query(query.getByDSId, [
    dsId,
  ]);

  if (rowCount === 0) {
    return [];
  }
  const adresses = await getAdressByIds(hebergements.map((h) => h.adresseId));
  return await Promise.all(
    hebergements.map((h) =>
      mapDBHebergementToDSHebergement(
        h,
        adresses.find((a) => a.id === h.adresseId),
      ),
    ),
  );
};
