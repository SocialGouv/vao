const { statuts, Types, Categorie } = require("../helpers/eig");
const logger = require("../utils/logger");
const AppError = require("../utils/error");
const pool = require("../utils/pgpool").getPool();

const log = logger(module.filename);

const query = {
  create: `
  INSERT INTO
    FRONT.EIG (USER_ID, STATUT_ID, DEMANDE_SEJOUR_ID, DEPARTEMENT, IS_ATTESTE)
  VALUES
    (
        $1,
        (SELECT ID FROM FRONT.EIG_STATUT WHERE STATUT = '${statuts.BROUILLON}'),
        $2,
        $3,
        FALSE
    )
  RETURNING id
  `,
  delete: `
DELETE FROM FRONT.EIG
WHERE
    ID = $1
`,
  deleteEigToEigType: `
DELETE FROM FRONT.EIG_TO_EIG_TYPE
WHERE
    EIG_ID = $1`,
  depose: `
  UPDATE FRONT.EIG
  SET
      STATUT_ID = (
          SELECT
          ID
      FROM
          FRONT.EIG_STATUT
      WHERE
          STATUT = 'ENVOYE'
      ),
      IS_ATTESTE = TRUE,
      DATE_DEPOT = NOW()
  WHERE
      ID = $1
  `,
  get: (where, search) => `
SELECT
  EIG.ID,
  EIG.created_at as "createdAt",
  EIG.DEPARTEMENT as "departement",
  S.STATUT AS "statut",
  DS.ID_FONCTIONNELLE AS "idFonctionnelle",
  DS.LIBELLE,
  DS.DATE_DEBUT AS "dateDebut",
  DS.DATE_FIN AS "dateFin",
  EIG.DATE_DEPOT AS "dateDepot",
  DS.ORGANISME -> 'personneMorale' ->> 'raisonSociale' AS "raisonSociale",
  DS.ORGANISME -> 'personnePhysique' ->> 'prenom' AS "prenom",
  DS.ORGANISME -> 'personnePhysique' ->> 'nomUsage' AS "nom",
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
  ${search}
GROUP BY
  EIG.ID,
  S.ID,
  DS.ID
  `,
  getById: `
SELECT
EIG.ID,
  EIG.USER_ID AS "userId",
  S.STATUT AS "statut",
  EIG.DEPARTEMENT AS "departement",
  DS.ID AS "declarationId",
  DS.ID_FONCTIONNELLE AS "idFonctionnelle",
  DS.LIBELLE as "libelle",
  DS.DATE_DEBUT AS "dateDebut",
  DS.DATE_FIN AS "dateFin",
  DS.ORGANISME_ID as "organismeId",
  DS.ORGANISME -> 'personneMorale' ->> 'raisonSociale' AS "raisonSociale",
  DS.ORGANISME -> 'personnePhysique' ->> 'prenom' AS "prenom",
  DS.ORGANISME -> 'personnePhysique' ->> 'nomUsage' AS "nom",
  DS.PERSONNEL -> 'encadrants' as "encadrants",
  DS.PERSONNEL -> 'accompagnants' as "accompagnants",
  DS.STATUT as "dsStatut",
  (SELECT DISTINCT
    ARRAY_AGG(A.LABEL) as "label"
  FROM
    FRONT.DEMANDE_SEJOUR_TO_HEBERGEMENT DSTH
    INNER JOIN FRONT.HEBERGEMENT H ON H.ID = DSTH.HEBERGEMENT_ID
    INNER JOIN FRONT.ADRESSE A ON A.ID = H.ADRESSE_ID
  WHERE
    DEMANDE_SEJOUR_ID = DS.ID) as "adresses",
  DS.PERIODE as "saison",
  ARRAY_AGG(JSON_BUILD_OBJECT('type',ET.TYPE,'categorie',EC.CATEGORIE,'precision',E2ET.PRECISIONS)) as "types",
  EIG.DEROULEMENT as "deroulement",
  EIG.DISPOSITION_REMEDIATION as "dispositionRemediation",
  EIG.DISPOSITION_VICTIMES as "dispositionVictimes",
  EIG.DISPOSITION_INFORMATIONS as "dispositionInformations",
  EIG.IS_ATTESTE as "isAtteste",
  EIG.PERSONNEL as "personnel",
  EIG.EMAIL_AUTRES_DESTINATAIRES as "emailAutresDestinataires"
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
  getEmailByTerCode: `
WITH
  roles AS
  (
    SELECT array_agg(id) as ids
    from back.roles
    WHERE label IN ('eig')
  ),
  users AS
  (
    SELECT u.mail AS mail, array_agg(ur.rol_id) as ids
    FROM back.users u
    JOIN back.user_roles ur ON u.id = ur.use_id
    WHERE u.ter_code = $1
    GROUP BY mail
  )
SELECT mail
FROM
  roles r,
  users u
WHERE u.ids && r.ids`,
  getStatut: `
  SELECT S.STATUT as statut
  FROM FRONT.EIG
  LEFT JOIN FRONT.EIG_STATUT S ON S.ID = EIG.STATUT_ID
  WHERE EIG.ID = $1
  `,
  getTotal: (where, search) => `
SELECT COUNT(DISTINCT EIG.ID)
FROM
  FRONT.EIG EIG
  INNER JOIN FRONT.USER_ORGANISME UO ON EIG.USER_ID = UO.USE_ID
  LEFT JOIN FRONT.DEMANDE_SEJOUR DS ON DS.ID = EIG.DEMANDE_SEJOUR_ID
  LEFT JOIN FRONT.EIG_STATUT S ON S.ID = EIG.STATUT_ID
WHERE
  ${where}
  ${search.map((s) => ` AND ${s} `).join("")}
  `,
  insertIntoEigToEigType: (values) => `
    INSERT INTO FRONT.EIG_TO_EIG_TYPE (EIG_ID, EIG_TYPE_ID, PRECISIONS)
    VALUES
    ${values.join(",")}
  `,
  markAsRead: `
UPDATE FRONT.EIG
SET
  STATUT_ID = (
    SELECT
      ID
    FROM
      FRONT.EIG_STATUT
    WHERE
      STATUT = 'LU'
)
WHERE
  ID = $1
  `,
  updateDs: `
UPDATE FRONT.EIG
SET
  DEMANDE_SEJOUR_ID = $1,
  DEPARTEMENT=$2,
  EDITED_AT = NOW()
WHERE
  ID = $3
RETURNING id
  `,
  updateEmailAutresDestinataires: `
UPDATE FRONT.EIG
SET
  EMAIL_AUTRES_DESTINATAIRES = $1,
  EDITED_AT = NOW()
WHERE
  ID = $2
RETURNING id
  `,
  updateRenseignementGeneraux: `
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
};

module.exports.create = async ({ userId, declarationId, departement }) => {
  log.i("create - IN");

  const response = await pool.query(query.create, [
    userId,
    declarationId,
    departement,
  ]);
  log.d(response);
  const { id } = response.rows[0];
  log.i("create - DONE", { eigId: id });
  return id;
};

module.exports.getById = async ({ eigId }) => {
  log.i("create - IN");

  const response = await pool.query(query.getById, [eigId]);
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

module.exports.getByDsId = async (dsId) => {
  log.i("create - IN");

  const response = await pool.query(query.get("DS.ID = $1", ""), [dsId]);

  log.d(response);
  log.i("create - DONE");
  return response.rows ?? [];
};

module.exports.getByDsIdAdmin = async (dsId) => {
  log.i("create - IN");

  const response = await pool.query(
    query.get("DS.ID = $1 AND S.STATUT <> 'BROUILLON'", "") +
      "ORDER BY EIG.ID DESC",
    [dsId],
  );

  log.d(response);
  log.i("create - DONE");
  return response.rows ?? [];
};

module.exports.getStatut = async (eigId) => {
  log.i("getStatut - IN");

  const response = await pool.query(query.getStatut, [eigId]);
  log.d(response);
  log.i("getStatut - DONE");
  return response.rows?.[0]?.statut ?? null;
};

module.exports.updateDS = async (eigId, { declarationId, departement }) => {
  log.i("updateDS - IN");

  const response = await pool.query(query.updateDs, [
    declarationId,
    departement,
    eigId,
  ]);
  log.d(response);
  const { id } = response.rows[0];
  log.i("updateDS - DONE", { eigId: id });
  return id;
};

module.exports.updateEmailAutresDestinataires = async (
  eigId,
  { emailAutresDestinataires },
) => {
  log.i("updateEmailAutresDestinataires - IN");

  const response = await pool.query(query.updateEmailAutresDestinataires, [
    emailAutresDestinataires,
    eigId,
  ]);
  log.d(response);
  const { id } = response.rows[0];
  log.i("updateEmailAutresDestinataires - DONE", { eigId: id });
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
    await client.query(query.deleteEigToEigType, [eigId]);
    await client.query(query.insertIntoEigToEigType(values), params);
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

  const response = await pool.query(query.updateRenseignementGeneraux, [
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

const getEigs = async (
  where,
  intialParams,
  { limit, offset, sortBy, sortDirection = "ASC", search } = {},
) => {
  log.i("getByUserId - IN");
  const searchQuery = [];
  const params = [...(intialParams ?? [])];

  // Search management
  if (search?.idFonctionnelle && search.idFonctionnelle.length) {
    searchQuery.push(`DS.id_fonctionnelle ILIKE $${params.length + 1}`);
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
    searchQuery.push(
      `unaccent(DS.LIBELLE) ILIKE unaccent($${params.length + 1})`,
    );
    params.push(`%${search.libelle}%`);
  }

  if (search?.organisme && search.organisme.length) {
    searchQuery.push(`
    (CONCAT(
		DS.ORGANISME -> 'personnePhysique' ->> 'prenom',
		' ',
		DS.ORGANISME -> 'personnePhysique' ->> 'nomUsage'
	) ILIKE $${params.length + 1}
	OR DS.ORGANISME -> 'personneMorale' ->> 'raisonSociale' ILIKE $${params.length + 1})`);
    params.push(`%${search.organisme}%`);
  }

  if (search?.departement && search.departement.length) {
    searchQuery.push(`eig.departement = $${params.length + 1}`);
    params.push(`${search?.departement}`);
  }

  let queryWithPagination = query.get(
    where,
    searchQuery.map((s) => ` AND ${s} `).join(""),
  );

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
    await pool.query(query.getTotal(where, searchQuery), params)
  ).rows.find((t) => t.count)?.count;

  log.d(response);
  log.i("getByUserId - DONE");
  return {
    eigs: response.rows ?? [],
    total: total ? parseInt(total) : 0,
  };
};

module.exports.getByUserId = async (
  userId,
  { limit, offset, sortBy, sortDirection = "ASC", search } = {},
) => {
  const params = [userId];
  const where = `UO.ORG_ID IN ( SELECT ORG_ID FROM FRONT.USER_ORGANISME WHERE USE_ID = $1)`;

  return await getEigs(where, params, {
    limit,
    offset,
    search,
    sortBy,
    sortDirection,
  });
};

module.exports.getAdmin = async ({
  limit,
  offset,
  sortBy,
  sortDirection = "ASC",
  search,
} = {}) => {
  const where = `S.STATUT <> 'BROUILLON'`;

  return await getEigs(where, [], {
    limit,
    offset,
    search,
    sortBy,
    sortDirection,
  });
};

module.exports.getEmailByTerCode = async (terCode) => {
  log.i("getEmailByTerCode - IN", terCode);
  const { rows: data } = await pool.query(query.getEmailByTerCode, [terCode]);
  log.i("getEmailByTerCode - DONE");
  return data.map((m) => m.mail);
};

module.exports.depose = async (eigId) => {
  log.i("depose - IN", eigId);

  await pool.query(query.depose, [eigId]);
  log.i("getEmailByTerCode - DONE");
  return eigId;
};

module.exports.delete = async ({ eigId }) => {
  log.i("delete EIG - IN");
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query(query.deleteEigToEigType, [eigId]);
    await client.query(query.delete, [eigId]);
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

module.exports.markAsRead = async (eigId) => {
  log.i("updateStatut - IN", { eigId });
  await pool.query(query.markAsRead, [eigId]);
  log.i("updateStatut - DONE");
  return eigId;
};
