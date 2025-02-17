/* eslint-disable no-param-reassign */
const logger = require("../../utils/logger");
const {
  saveAdresse,
  getById: getAdressById,
  getByIds: getAdressByIds,
} = require("../adresse");

const {
  applyFilters,
  applyPagination,
  sanitizePaginationParams,
  sanitizeFiltersParams,
} = require("../../helpers/queryParams");

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
      AMENAGEMENTS_SPECIFIQUES_PRECISION,
      STATUT_ID
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
      $7,                                                               --EMAIL,
      $8,                                                               --ADRESSE_ID,
      $9,                                                               --TELEPHONE_1,
      $10,                                                               --TELEPHONE_2,
      $11,                                                              --NOM_GESTIONNAIRE,
      (SELECT ID FROM FRONT.HEBERGEMENT_TYPE WHERE VALUE = $12),          --TYPE_ID,
      (SELECT ID FROM FRONT.HEBERGEMENT_TYPE_PENSION WHERE VALUE = $13),  --TYPE_PENSION_ID,
      $14,                                                              --NOMBRE_LITS,
      $15,                                                              --LIT_DESSUS,
      $16,                                                              --NOMBRE_LITS_SUPERPOSES,
      $17,                                                              --NOMBRE_MAX_PERSONNES_COUCHAGE,
      $18,                                                              --VISITE_LOCAUX,
      (SELECT ID FROM FRONT.HEBERGEMENT_ACCESSIBILITE WHERE VALUE = $19), --ACCESSIBILITE_ID,
      $20,                                                              --CHAMBRES_DOUBLES,
      $21,                                                              --CHAMBRES_UNISEXES,
      $22,                                                              --REGLEMENTATION_ERP,
      $23,                                                              --COUCHAGE_INDIVIDUEL,
      $24,                                                              --RANGEMENT_INDIVIDUEL,
      $25,                                                              --AMENAGEMENTS_SPECIFIQUES,
      $26,                                                              --DESCRIPTION_LIEU_HEBERGEMENT,
      $27,                                                              --EXCURSION_DESCRIPTION,
      $28,                                                              --DEPLACEMENT_PROXIMITE_DESCRIPTION,
      $29,                                                              --VEHICULES_ADAPTES,
      $30,                                                              --FILE_REPONSE_EXPLOITANT_OU_PROPRIETAIRE,
      $31,                                                              --FILE_DERNIER_ARRETE_AUTORISATION_MAIRE,
      $32,                                                              --FILE_DERNIERE_ATTESTATION_SECURITE
      $33,                                                              --VISITE_LOCAUX_AT
      $34,                                                              --ACCESSIBILITE_PRECISION
      $35,                                                              --AMENAGEMENTS_SPECIFIQUES_PRECISION
      (SELECT ID FROM FRONT.HEBERGEMENT_STATUT WHERE VALUE = $36)        -- STATUT
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
        AND h.statut_id = (SELECT id FROM front.hebergement_statut WHERE value = 'actif')
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
      h.edited_at as "editedAt",
      hs.value as "statut"
    FROM front.hebergement h
    JOIN front.organismes o ON h.organisme_id = o.id
    LEFT JOIN front.adresse a on a.id = h.adresse_id
    LEFT JOIN front.hebergement_statut hs on hs.id = h.statut_id
    WHERE o.personne_morale->>'siren' = $1
    `,
  getListe: () => `
    WITH stat AS (
      SELECT id,
            COUNT(id)::INTEGER AS "hebergementCount"
      FROM front.hebergement
      GROUP BY id
    ),
    agrement_data AS (
      SELECT
        h.id as "id"
      FROM front.hebergement h
    )
      SELECT
        h.id as "id",
        nom as "nom",
        a.label as "adresse",
        a.departement as "departement",
        hs.value as "statut",
        uo.use_id
      FROM front.hebergement h
		LEFT JOIN stat ON stat.id = h.id
    	LEFT JOIN agrement_data ad ON ad."id" = h.id
      LEFT JOIN front.user_organisme uo ON uo.org_id = h.organisme_id
      LEFT JOIN front.adresse a ON a.id = h.adresse_id
      LEFT JOIN front.hebergement_statut hs on hs.id = h.statut_id
      WHERE CURRENT IS TRUE
    `,
  getPreviousValueForHistory: `
  SELECT
    h.hebergement_id AS "hebergementUuid",
    h.organisme_id AS "organismeId",
    h.created_by AS "createdBy",
    h.created_at AS "createdAt",
    h.current AS "current",
    hs.value AS "statut"
  FROM
    front.hebergement h
    LEFT JOIN front.hebergement_statut hs ON hs.id = h.statut_id
  WHERE
    h.id = $1;
  `,
  getStatut: `
    SELECT
      value AS "statut"
    FROM
      front.hebergement h
      LEFT JOIN front.hebergement_statut hs ON h.statut_id = hs.id
    WHERE
      h.id = $1
  `,

  historize: `
    UPDATE front.hebergement
    SET current = FALSE
    WHERE id = $1
  `,
  removePrestationsHoteliere: `
  DELETE FROM front.hebergement_to_prestations_hotelieres
  WHERE
    hebergement_id = $1;
  `,
  update: `
  UPDATE front.hebergement
  SET
    edited_by = $2,
    edited_at = NOW(),
    nom = $3,
    email = $4,
    adresse_id = $5,
    telephone_1 = $6,
    telephone_2 = $7,
    nom_gestionnaire = $8,
    type_id = (SELECT id FROM front.hebergement_type WHERE value = $9),
    type_pension_id = (SELECT id FROM front.hebergement_type_pension WHERE value = $10),
    nombre_lits = $11,
    lit_dessus = $12,
    nombre_lits_superposes = $13,
    nombre_max_personnes_couchage = $14,
    visite_locaux = $15,
    accessibilite_id = (SELECT id FROM front.hebergement_accessibilite WHERE value = $16),
    chambres_doubles = $17,
    chambres_unisexes = $18,
    reglementation_erp = $19,
    couchage_individuel = $20,
    rangement_individuel = $21,
    amenagements_specifiques = $22,
    description_lieu_hebergement = $23,
    excursion_description = $24,
    deplacement_proximite_description = $25,
    vehicules_adaptes = $26,
    file_reponse_exploitant_ou_proprietaire = $27,
    file_dernier_arrete_autorisation_maire = $28,
    file_derniere_attestation_securite = $29,
    visite_locaux_at = $30,
    accessibilite_precision = $31,
    amenagements_specifiques_precision = $32,
    statut_id = (SELECT id FROM front.hebergement_statut WHERE value = $33)
  WHERE
    id = $1
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
  { createdBy, createdAt, updatedBy, organismeId, statut },
  { nom, coordonnees, informationsLocaux, informationsTransport },
  hebergemenetUuid,
) => {
  const adresseId = coordonnees.adresse
    ? await saveAdresse(client, coordonnees.adresse)
    : null;
  const { rows } = await client.query(query.create, [
    organismeId, // $1
    createdBy,
    updatedBy,
    createdAt,
    hebergemenetUuid ?? crypto.randomUUID(), // 5
    nom,
    coordonnees.email,
    adresseId,
    coordonnees.numTelephone1,
    coordonnees.numTelephone2, // 10
    coordonnees.nomGestionnaire,
    informationsLocaux.type,
    informationsLocaux.pension,
    informationsLocaux.nombreLits,
    informationsLocaux.litsDessus, // 15
    informationsLocaux.nombreLitsSuperposes,
    informationsLocaux.nombreMaxPersonnesCouchage,
    informationsLocaux.visiteLocaux,
    informationsLocaux.accessibilite,
    informationsLocaux.chambresDoubles, // 20
    informationsLocaux.chambresUnisexes,
    informationsLocaux.reglementationErp,
    informationsLocaux.couchageIndividuel,
    informationsLocaux.rangementIndividuel,
    informationsLocaux.amenagementsSpecifiques, // 25
    informationsLocaux.descriptionLieuHebergement,
    informationsTransport.excursion,
    informationsTransport.deplacementProximite,
    informationsTransport.vehiculesAdaptes,
    informationsLocaux.fileReponseExploitantOuProprietaire?.uuid ?? null, // 30
    informationsLocaux.fileDernierArreteAutorisationMaire?.uuid ?? null,
    informationsLocaux.fileDerniereAttestationSecurite?.uuid ?? null,
    informationsLocaux.visiteLocauxAt,
    informationsLocaux.accessibilitePrecision,
    informationsLocaux.precisionAmenagementsSpecifiques,
    statut,
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

module.exports.create = async (userId, organismeId, statut, hebergement) => {
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
        statut,
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

// Utilisée par exemple lorsque l'on modifie un hebergement en statut brouillon
module.exports.updateWithoutHistory = async (
  userId,
  hebergementId,
  statut,
  hebergement,
) => {
  log.i("updateWithoutHistory - IN");
  const { nom, coordonnees, informationsLocaux, informationsTransport } =
    hebergement;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const adresseId = coordonnees.adresse
      ? await saveAdresse(client, coordonnees.adresse)
      : null;
    await client.query(query.update, [
      hebergementId,
      userId,
      nom,
      coordonnees.email,
      adresseId,
      coordonnees.numTelephone1,
      coordonnees.numTelephone2,
      coordonnees.nomGestionnaire,
      informationsLocaux.type,
      informationsLocaux.pension,
      informationsLocaux.nombreLits,
      informationsLocaux.litsDessus,
      informationsLocaux.nombreLitsSuperposes,
      informationsLocaux.nombreMaxPersonnesCouchage,
      informationsLocaux.visiteLocaux,
      informationsLocaux.accessibilite,
      informationsLocaux.chambresDoubles,
      informationsLocaux.chambresUnisexes,
      informationsLocaux.reglementationErp,
      informationsLocaux.couchageIndividuel,
      informationsLocaux.rangementIndividuel,
      informationsLocaux.amenagementsSpecifiques,
      informationsLocaux.descriptionLieuHebergement,
      informationsTransport.excursion,
      informationsTransport.deplacementProximite,
      informationsTransport.vehiculesAdaptes,
      informationsLocaux.fileReponseExploitantOuProprietaire?.uuid ?? null,
      informationsLocaux.fileDernierArreteAutorisationMaire?.uuid ?? null,
      informationsLocaux.fileDerniereAttestationSecurite?.uuid ?? null,
      informationsLocaux.visiteLocauxAt,
      informationsLocaux.accessibilitePrecision,
      informationsLocaux.precisionAmenagementsSpecifiques,
      statut,
    ]);

    await client.query(query.removePrestationsHoteliere, [hebergementId]);
    const prestationsHotelieres = informationsLocaux.prestationsHotelieres;
    if (prestationsHotelieres.length > 0) {
      await client.query(
        query.associatePrestation(prestationsHotelieres.length),
        [hebergementId, ...prestationsHotelieres],
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  log.i("updateWithoutHistory - DONE");
  return hebergementId;
};

module.exports.update = async (userId, hebergementId, hebergement) => {
  log.i("update - IN");
  const {
    rows: [
      { hebergementUuid, organismeId, createdBy, createdAt, current, statut },
    ],
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
        statut,
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
  log.i("update - DONE");
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

module.exports.getByUserId = async (userId, queryParams) => {
  log.i("getByUserId - IN", { userId });
  const queryParamsWithUserId = { ...queryParams, userId };

  const titles = [
    {
      key: "h.nom",
      queryKey: "nom",
      sortEnabled: true,
      type: "default",
    },
    {
      key: "a.label",
      queryKey: "adresse",
      sortEnabled: true,
      type: "default",
    },
    {
      key: "hs.value",
      queryKey: "statut",
      sortEnabled: true,
      type: "default",
    },
    {
      key: "uo.use_id",
      queryKey: "userId",
      sortEnabled: true,
      type: "number",
    },
  ];
  const filterParams = sanitizeFiltersParams(queryParamsWithUserId, titles);
  const queryGet = query.getListe();
  const filterQuery = applyFilters(queryGet, [], filterParams);
  const { limit, offset, sortBy, sortDirection } = sanitizePaginationParams(
    queryParamsWithUserId,
    titles,
  );
  const paginatedQuery = applyPagination(
    filterQuery.query,
    filterQuery.params,
    limit,
    offset,
    sortBy,
    sortDirection,
  );
  const result = await Promise.all([
    pool.query(paginatedQuery.query, paginatedQuery.params),
    pool.query(paginatedQuery.countQuery, paginatedQuery.countQueryParams),
  ]);
  return {
    rows: result[0].rows,
    total: parseInt(result[1].rows[0].total, 10),
  };
};

module.exports.getBySiren = async (siren, search) => {
  log.i("getBySiren - IN", { siren });

  let queryGet = query.getBySiren;
  const params = [siren];
  if (search.statut) {
    queryGet = `
    ${queryGet}
    AND h.statut_id = (SELECT id FROM front.hebergement_statut WHERE value = $2)
    `;
    params.push(search.statut);
  }

  const response = await pool.query(queryGet, params);
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
  const adresse = hebergement.adresseId
    ? await getAdressById(hebergement.adresseId)
    : null;

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

module.exports.getStatut = async (hebergementId) => {
  log.i("getStatut - IN");
  const response = await pool.query(query.getStatut, [hebergementId]);
  log.d(response);
  log.i("getStatut - DONE");
  return response.rows?.[0]?.statut ?? null;
};
