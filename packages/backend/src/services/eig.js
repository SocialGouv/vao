const { statuts, Types, Categorie } = require("../helpers/eig");
const logger = require("../utils/logger");
const AppError = require("../utils/error");
const pool = require("../utils/pgpool").getPool();

const log = logger(module.filename);

const getEigListQuery = (where) => `
SELECT
  EIG.ID,
  EIG.created_at as "createdAt",
  S.STATUT AS "statut",
  DS.ID_FONCTIONNELLE AS "idFonctionnelle",
  DS.LIBELLE,
  DS.DATE_DEBUT AS "dateDebut",
  DS.DATE_FIN AS "dateFin",
  ARRAY_AGG(ET.TYPE) as "types"
FROM
  FRONT.EIG EIG
  INNER JOIN FRONT.USER_ORGANISME UO ON EIG.USER_ID = UO.USE_ID
  LEFT JOIN FRONT.EIG_TO_EIG_TYPE E2ET ON E2ET.EIG_ID = EIG.ID
  LEFT JOIN FRONT.EIG_TYPE ET ON ET.ID = E2ET.EIG_TYPE_ID
  LEFT JOIN FRONT.DEMANDE_SEJOUR DS ON DS.ID = EIG.DEMANDE_SEJOUR_ID
  LEFT JOIN FRONT.EIG_STATUT S ON S.ID = EIG.STATUT_ID
WHERE
 ${where}
GROUP BY
  EIG.ID,
  S.ID,
  DS.ID
  `;

const query = {
  CREATE: `
  INSERT INTO
    FRONT.EIG (USER_ID, STATUT_ID, DEMANDE_SEJOUR_ID, IS_ATTESTE)
  VALUES
    (
        $1,
        (SELECT ID FROM FRONT.EIG_STATUT WHERE STATUT = '${statuts.BROUILLON}'),
        $2,
        FALSE
       )
   RETURNING id
  `,
  DELETE_EIG_TO_EIG_TYPE: `
DELETE FROM FRONT.EIG_TO_EIG_TYPE
WHERE
EIG_ID = $1`,
  GET_BY_DS_ID: getEigListQuery("DS.ID = $1"),
  GET_BY_ID: `
SELECT
EIG.ID,
  EIG.USER_ID AS "userId",
  S.STATUT AS "statut",
  DS.ID AS "demandeSejourId",
  DS.ID_FONCTIONNELLE AS "idFonctionnelle",
  DS.LIBELLE,
  DS.DATE_DEBUT AS "dateDebut",
  DS.DATE_FIN AS "dateFin",
  DS.ORGANISME -> 'personneMorale' ->> 'raisonSociale' AS "raisonSociale",
  DS.ORGANISME -> 'personnePhysique' ->> 'prenom' AS "prenom",
  DS.ORGANISME -> 'personnePhysique' ->> 'nomUsage' AS "nom",
  DS.PERSONNEL -> 'encadrants' as "encadrants",
  DS.PERSONNEL -> 'accompagnants' as "accompagnants",
  DS.STATUT as "dsStatut",
  JSONB_PATH_QUERY_ARRAY(DS.HEBERGEMENT,'$.hebergements.coordonnees.adresse.label') as "adresses",
  DS.PERIODE as "saison",
  ARRAY_AGG(JSON_BUILD_OBJECT('type',ET.TYPE,'categorie',EC.CATEGORIE,'precision',E2ET.PRECISIONS)) as "types",
  EIG.DEROULEMENT as "deroulement",
  EIG.DISPOSITION_REMEDIATION as "dispositionRemediation",
  EIG.DISPOSITION_VICTIMES as "dispositionVictimes",
  EIG.DISPOSITION_INFORMATIONS as "dispositionInformations",
  EIG.IS_ATTESTE,
  EIG.PERSONNEL
FROM FRONT.EIG EIG
    LEFT JOIN FRONT.EIG_TO_EIG_TYPE E2ET ON E2ET.EIG_ID = EIG.ID
    LEFT JOIN FRONT.EIG_TYPE ET ON ET.ID = E2ET.EIG_TYPE_ID
    LEFT JOIN FRONT.EIG_CATEGORIE EC ON EC.ID = ET.EIG_CATEGORIE_ID
    LEFT JOIN FRONT.DEMANDE_SEJOUR DS ON DS.ID = EIG.DEMANDE_SEJOUR_ID
    LEFT JOIN FRONT.EIG_STATUT S ON S.ID = EIG.STATUT_ID
WHERE
  EIG.ID = $1
GROUP BY
  EIG.ID,
  S.ID,
  DS.ID;
  `,
  GET_BY_USER_ID: (search) =>
    getEigListQuery(
      `
    UO.ORG_ID IN ( SELECT ORG_ID FROM FRONT.USER_ORGANISME WHERE USE_ID = $1)
    ${search.map((s) => ` AND ${s} `).join("")}`,
    ),
  GET_STATUT: `
  SELECT S.STATUT as statut
  FROM FRONT.EIG
  LEFT JOIN FRONT.EIG_STATUT S ON S.ID = EIG.STATUT_ID
  WHERE EIG.ID = $1
  `,
  GET_TOTAL: (search) => `
SELECT COUNT(DISTINCT EIG.ID)
FROM
  FRONT.EIG EIG
  INNER JOIN FRONT.USER_ORGANISME UO ON EIG.USER_ID = UO.USE_ID
  LEFT JOIN FRONT.DEMANDE_SEJOUR DS ON DS.ID = EIG.DEMANDE_SEJOUR_ID
  LEFT JOIN FRONT.EIG_STATUT S ON S.ID = EIG.STATUT_ID
WHERE
  UO.ORG_ID IN ( SELECT ORG_ID FROM FRONT.USER_ORGANISME WHERE USE_ID = $1)
  ${search.map((s) => ` AND ${s} `).join("")}
  `,
  INSERT_EIG_TO_EIG_TYPE: (values) => `
    INSERT INTO FRONT.EIG_TO_EIG_TYPE (EIG_ID, EIG_TYPE_ID, PRECISIONS)
    VALUES
    ${values.join(",")}
  `,
  UPDATE_DS: `
UPDATE FRONT.EIG
SET
  DEMANDE_SEJOUR_ID = $1,
  EDITED_AT = NOW()
WHERE
  ID = $2
RETURNING id
  `,
  UPDATE_RENSEIGNEMENT_GENERAUX: `
UPDATE FRONT.EIG
SET
  PERSONNEL = $2,
  DEROULEMENT = $3,
  DISPOSITION_REMEDIATION = $4,
  DISPOSITION_VICTIMES = $5,
  DISPOSITION_INFORMATIONS = $6,
  EDITED_AT = NOW()
WHERE
  ID = $1
RETURNING id
  `,
  DELETE: `
DELETE FROM FRONT.EIG
WHERE
    ID = $1
`,
};

module.exports.create = async ({ userId, demandeSejourId }) => {
  log.i("create - IN");

  const response = await pool.query(query.CREATE, [userId, demandeSejourId]);
  log.d(response);
  const { id } = response.rows[0];
  log.i("create - DONE", { eigId: id });
  return id;
};

module.exports.getById = async ({ eigId }) => {
  log.i("create - IN");

  const response = await pool.query(query.GET_BY_ID, [eigId]);
  if (response.rows.length === 0) {
    throw new AppError("EIG non trouvé");
  }
  if (response.rows.length >= 2) {
    throw new AppError("La requete retourne trop d'eig");
  }
  const rawResult = response.rows[0];

  log.d(response);
  log.i("create - DONE");
  return {
    ...rawResult,
    types: (rawResult?.types ?? []).filter((t) => !!t.type),
  };
};

module.exports.getByDsId = async ({ dsId }) => {
  log.i("create - IN");

  const response = await pool.query(query.GET_BY_DS_ID, [dsId]);

  log.d(response);
  log.i("create - DONE");
  return response.rows ?? [];
};

module.exports.getStatut = async (eigId) => {
  log.i("getStatut - IN");

  const response = await pool.query(query.GET_STATUT, [eigId]);
  log.d(response);
  log.i("getStatut - DONE");
  return response.rows?.[0]?.statut ?? null;
};

module.exports.updateDS = async (eigId, { demandeSejourId }) => {
  log.i("updateDS - IN");

  const response = await pool.query(query.UPDATE_DS, [demandeSejourId, eigId]);
  log.d(response);
  const { id } = response.rows[0];
  log.i("updateDS - DONE", { eigId: id });
  return id;
};

module.exports.updateType = async (
  eigId,
  {
    types,
    victimesAutrePrecision,
    securiteAutrePrecision,
    santeAutrePrecision,
    fonctionnementAutrePrecision,
  },
) => {
  log.i("updateType - IN");
  log.i("updateType - DONE", { eigId });
  const client = await pool.connect();

  const params = [];

  const values = types.map((et) => {
    let precision;
    switch (et) {
      case Types[Categorie.FONCTIONNEMENT_ORGANISME].AUTRE:
        precision = fonctionnementAutrePrecision;
        break;
      case Types[Categorie.VICTIMES].AUTRE:
        precision = victimesAutrePrecision;
        break;
      case Types[Categorie.SANTE].AUTRE:
        precision = santeAutrePrecision;
        break;
      case Types[Categorie.SECURITE].AUTRE:
        precision = securiteAutrePrecision;
        break;
    }

    const values = `($${params.length + 1}, (SELECT ID FROM FRONT.EIG_TYPE WHERE TYPE = $${params.length + 2}), ${precision ? "$" + (params.length + 3) : "NULL"} )`;

    params.push(eigId);
    params.push(et);
    if (precision) {
      params.push(precision);
    }
    return values;
  });

  try {
    await client.query("BEGIN");
    await client.query(query.DELETE_EIG_TO_EIG_TYPE, [eigId]);
    await client.query(query.INSERT_EIG_TO_EIG_TYPE(values), params);
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }

  return eigId;
};

module.exports.updateRenseignementsGeneraux = async (
  eigId,
  {
    personnel,
    deroulement,
    dispositionRemediation,
    dispositionVictimes,
    dispositionInformations,
  },
) => {
  log.i("updateRenseignementsGeneraux - IN");

  const response = await pool.query(query.UPDATE_RENSEIGNEMENT_GENERAUX, [
    eigId,
    personnel,
    deroulement,
    dispositionRemediation,
    dispositionVictimes,
    dispositionInformations,
  ]);
  log.d(response);
  const { id } = response.rows[0];
  log.i("updateRenseignementsGeneraux - DONE", { eigId: id });
  return id;
};

module.exports.getByUserId = async (
  userId,
  { limit, offset, sortBy, sortDirection = "ASC", search } = {},
) => {
  log.i("getByUserId - IN");
  const params = [userId];
  const searchQuery = [];

  // Search management
  if (search?.idFonctionnelle && search.idFonctionnelle.length) {
    searchQuery.push(`DS.id_fonctionnelle ilike $${params.length + 1}`);
    params.push(`%${search.idFonctionnelle}%`);
  }

  if (search?.statut && search.statut.length) {
    searchQuery.push(`s.statut = $${params.length + 1}`);
    params.push(`${search?.statut}`);
  }

  if (search?.type && search.type.length) {
    searchQuery.push(`
    EIG.ID IN (
    SELECT
      EIG_ID
    FROM
      FRONT.EIG_TO_EIG_TYPE E2ET
      INNER JOIN FRONT.EIG_TYPE ET ON ET.ID = E2ET.EIG_TYPE_ID
      AND ET.TYPE = $${params.length + 1}
)
    `);
    params.push(`${search.type}`);
  }

  if (search?.libelle && search.libelle.length) {
    searchQuery.push(`DS.LIBELLE ilike $${params.length + 1}`);
    params.push(`%${search.libelle}%`);
  }

  let queryWithPagination = query.GET_BY_USER_ID(searchQuery);

  if (sortBy && sortDirection) {
    queryWithPagination += `ORDER BY "${sortBy}" ${sortDirection}, EIG.CREATED_AT DESC`;
  } else {
    queryWithPagination += "ORDER BY EIG.CREATED_AT DESC";
  }

  const paramsWithPagination = [...params];
  // Pagination management
  if (limit != null && offset != null) {
    queryWithPagination += `
    OFFSET $${params.length + 1}
    LIMIT $${params.length + 2}
    `;
    paramsWithPagination.push(offset, limit);
  }

  const response = await pool.query(queryWithPagination, paramsWithPagination);

  if (limit === null || response.rowCount < limit) {
    log.d(response);
    log.i("getByUserId - DONE");
    return {
      eigs: response.rows ?? [],
      total: response.rowCount + parseInt(offset ?? 0),
    };
  }

  const total = (
    await pool.query(query.GET_TOTAL(searchQuery, params), params)
  ).rows.find((t) => t.count)?.count;

  log.d(response);
  log.i("getByUserId - DONE");
  return {
    eigs: response.rows ?? [],
    total: total ? parseInt(total) : 0,
  };
};

module.exports.delete = async ({ eigId }) => {
  log.i("delete EIG - IN");
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query(query.DELETE_EIG_TO_EIG_TYPE, [eigId]);
    await client.query(query.DELETE, [eigId]);
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }

  log.i("delete EIG - OUT");

  return eigId;
};
