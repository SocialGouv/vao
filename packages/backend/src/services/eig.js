const Sentry = require("@sentry/node");

const { sentry } = require("../config");
const { statuts, Types, Categorie } = require("../helpers/eig");
const logger = require("../utils/logger");
const AppError = require("../utils/error");
const { getPool } = require("../utils/pgpool");
const { addHistoric } = require("./Tracking");
const { getFileMetaData } = require("./Document");

const { entities, userTypes } = require("../helpers/tracking");
const { encrypt, decrypt } = require("../utils/cipher");

const log = logger(module.filename);

const commonQuery = {
  agrementRegionObtention: `    
    CASE
      WHEN o.type_organisme = 'personne_morale' AND pm.porteur_agrement::boolean is False
      THEN
      (
          SELECT
            region_obtention
          FROM front.agrements a
          JOIN front.organismes o2 ON o2.id = a.organisme_id
          INNER JOIN front.personne_morale pm2 ON pm2.organisme_id = o2.id AND pm2.current = TRUE
          INNER JOIN front.opm_etablissements etab ON etab.personne_morale_id = pm2.id
          WHERE pm.siret = etab.siret
          AND a.supprime = false
          LIMIT 1
      )
      ELSE (
        SELECT
            region_obtention
        FROM front.agrements a
        WHERE organisme_id = o.id
        AND a.supprime = false
      )
    END AS "agrementRegionObtention"`,
};

const query = {
  create: `
    INSERT INTO
      FRONT.EIG (USER_ID, STATUT_ID, DEMANDE_SEJOUR_ID, DEPARTEMENT, DATE, IS_ATTESTE)
    VALUES
      (
          $1,
          (SELECT ID FROM FRONT.EIG_STATUT WHERE STATUT = '${statuts.BROUILLON}'),
          $2,
          $3,
          $4,
          FALSE
      )
    RETURNING id
  `,
  delete: `
    DELETE FROM FRONT.EIG
    WHERE ID = $1
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
    EIG.date as "date",
    EIG.DEPARTEMENT as "departement",
    EIG.READ_BY_DREETS as "readByDreets",
    EIG.READ_BY_DDETS as "readByDdets",
    S.STATUT AS "statut",
    DS.ID_FONCTIONNELLE AS "idFonctionnelle",
    DS.LIBELLE,
    DS.DATE_DEBUT AS "dateDebut",
    DS.DATE_FIN AS "dateFin",
    EIG.DATE_DEPOT AS "dateDepot",
    pm.raison_sociale AS "raisonSociale",
    pp.prenom AS "prenom",
    pp.nom_usage AS "nom",
    ARRAY_AGG(ET.TYPE) as "types",
    ${commonQuery.agrementRegionObtention},
    EIG.file
  FROM
    FRONT.EIG EIG
    INNER JOIN FRONT.USER_ORGANISME UO ON EIG.USER_ID = UO.USE_ID
    INNER JOIN FRONT.organismes o ON uo.org_id = o.id
    LEFT JOIN FRONT.AGREMENTS AGR on AGR.ORGANISME_ID = UO.ORG_ID
    LEFT JOIN FRONT.EIG_TO_EIG_TYPE E2ET ON E2ET.EIG_ID = EIG.ID
    LEFT JOIN FRONT.EIG_TYPE ET ON ET.ID = E2ET.EIG_TYPE_ID
    LEFT JOIN FRONT.DEMANDE_SEJOUR DS ON DS.ID = EIG.DEMANDE_SEJOUR_ID
    LEFT JOIN FRONT.EIG_STATUT S ON S.ID = EIG.STATUT_ID
    LEFT JOIN front.personne_morale pm ON pm.organisme_id = uo.org_id AND pm.current = TRUE
    LEFT JOIN front.personne_physique pp ON pp.organisme_id = uo.org_id AND pp.current = TRUE
  WHERE
    ${where}
    ${search}
  GROUP BY
    EIG.ID,
    o.id,
    S.ID,
    DS.ID,
    AGR.ID,
    pm.id,
    pp.id
  `,
  getAvailableDs: `
    SELECT
      ds.id AS "id",
      ds.id_fonctionnelle AS "idFonctionnelle",
      ds.libelle AS "libelle",
      ds.date_debut AS "dateDebut",
      ds.date_fin AS "dateFin"
    FROM
      front.demande_sejour ds
      JOIN front.organismes o ON o.id = ds.organisme_id
    WHERE
      (
        UNACCENT (libelle) ILIKE '%' || UNACCENT ($1) || '%'
        OR UNACCENT (id_fonctionnelle) ILIKE '%' || UNACCENT ($1) || '%'
      )
      -- ces regles implementent en sql la logique de isDeclarationligibleToEig
      AND ds.statut IN ('VALIDEE 8J', 'SEJOUR EN COURS', 'TERMINEE')
      AND ds.date_debut <= DATE_TRUNC('day', NOW())
      AND DATE_TRUNC('day', NOW()) <= ds.date_fin + INTERVAL '1 week'
      AND o.id = ANY ($2)
    LIMIT 10
  `,
  getById: `
    SELECT
    EIG.ID,
      EIG.USER_ID AS "userId",
      S.STATUT AS "statut",
      EIG.DEPARTEMENT AS "departement",
      (SELECT LABEL FROM GEO.TERRITOIRES WHERE CODE = EIG.DEPARTEMENT) as "departementLibelle",
      EIG.date as "date",
      EIG.READ_BY_DREETS as "readByDreets",
      EIG.READ_BY_DDETS as "readByDdets",
      eig.file as "uuid",
      DS.ID AS "declarationId",
      DS.ID_FONCTIONNELLE AS "idFonctionnelle",
      DS.LIBELLE as "libelle",
      DS.DATE_DEBUT AS "dateDebut",
      DS.DATE_FIN AS "dateFin",
      DS.ORGANISME_ID as "organismeId",
      pm.raison_sociale AS "raisonSociale",
      pp.prenom AS "prenom",
      pp.nom_usage AS "nom",
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
      EIG.EMAIL_AUTRES_DESTINATAIRES as "emailAutresDestinataires",
      ${commonQuery.agrementRegionObtention}
    FROM FRONT.EIG EIG
        INNER JOIN FRONT.USER_ORGANISME UO ON EIG.USER_ID = UO.USE_ID
        INNER JOIN FRONT.organismes o ON uo.org_id = o.id
        LEFT JOIN FRONT.AGREMENTS AGR on AGR.ORGANISME_ID = UO.ORG_ID
        LEFT JOIN FRONT.EIG_TO_EIG_TYPE E2ET ON E2ET.EIG_ID = EIG.ID
        LEFT JOIN FRONT.EIG_TYPE ET ON ET.ID = E2ET.EIG_TYPE_ID
        LEFT JOIN FRONT.EIG_CATEGORIE EC ON EC.ID = ET.EIG_CATEGORIE_ID
        LEFT JOIN FRONT.DEMANDE_SEJOUR DS ON DS.ID = EIG.DEMANDE_SEJOUR_ID
        LEFT JOIN FRONT.EIG_STATUT S ON S.ID = EIG.STATUT_ID
        LEFT JOIN front.personne_morale pm ON pm.organisme_id = uo.org_id AND pm.current = TRUE
        LEFT JOIN front.personne_physique pp ON pp.organisme_id = uo.org_id AND pp.current = TRUE
    WHERE
      EIG.ID = $1
    GROUP BY
      EIG.ID,
      o.id,
      S.ID,
      DS.ID,
      AGR.ID,
      pm.id,
      pp.id
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
        AND deleted = false
        GROUP BY mail
      )
        SELECT mail
        FROM
          roles r,
          users u
        WHERE u.ids && r.ids`,
  getIsUserAllowedOrganisme: `
   SELECT
        eig.id
    FROM
        front.user_organisme UO
        INNER JOIN front.eig eig ON eig.user_id = uo.use_id
    WHERE
        UO.org_id IN ( SELECT uo.org_id 
                      FROM front.user_organisme uo
                      WHERE uo.USE_ID = $1)
        AND eig.id = $2
    `,
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
  getTotalToRead: `
  SELECT COUNT(distinct(e.id))
      FROM front.eig e
      INNER JOIN front.eig_statut s ON s.id = e.STATUT_ID AND s.statut = 'ENVOYE'
      INNER JOIN front.demande_sejour ds ON ds.id = e.demande_sejour_id
      INNER JOIN front.organismes o ON o.id = ds.organisme_id
      LEFT JOIN front.personne_morale pm ON pm.organisme_id = o.id AND pm.current = TRUE
      LEFT JOIN front.personne_physique pp ON pp.organisme_id = o.id AND pp.current = TRUE
      WHERE 
      (
        o.id IN (SELECT pm.organisme_id 
                  FROM front.personne_morale pm 
                   	INNER JOIN front.agrements a ON a.organisme_id = pm.organisme_id
				            INNER JOIN geo.territoires t ON t.code = a.region_obtention
				            INNER JOIN back.users u ON u.ter_code = t.code AND u.id = $1
                    INNER JOIN front.personne_morale pms ON pms.siren = substr(pm.siret,1,9)) AND pm.current = TRUE
     	  OR o.id IN (SELECT pm.organisme_id 
                  FROM front.personne_physique pp 
                   	INNER JOIN front.agrements a ON a.organisme_id = pp.organisme_id AND pp.current = TRUE
                    INNER JOIN geo.territoires t ON t.code = a.region_obtention
                    INNER JOIN back.users u ON u.ter_code = t.code AND u.id = $1) 
        AND e.read_by_dreets = false
      )
      OR 
      (
        ds.departement_suivi IN (SELECT ter_code 
                                FROM back.users u 
                                WHERE u.id = $1)
        AND e.read_by_ddets = false
      )
  `,
  insertIntoEigToEigType: (values) => `
    INSERT INTO FRONT.EIG_TO_EIG_TYPE (EIG_ID, EIG_TYPE_ID, PRECISIONS)
    VALUES
    ${values.join(",")}
  `,
  markAsReadDdets: `
    UPDATE FRONT.EIG
    SET
      READ_BY_DDETS = TRUE,
      STATUT_ID = CASE
        WHEN READ_BY_DREETS THEN (
          SELECT
            ID
          FROM
            FRONT.EIG_STATUT
          WHERE
            STATUT = 'LU'
        )
        ELSE STATUT_ID
      END,
      EDITED_AT = NOW()
    WHERE ID = $1
  `,
  markAsReadDreets: `
    UPDATE FRONT.EIG
    SET
      READ_BY_DREETS = TRUE,
      STATUT_ID = CASE
        WHEN READ_BY_DDETS THEN (
          SELECT
            ID
          FROM
            FRONT.EIG_STATUT
          WHERE
            STATUT = 'LU'
        )
        ELSE STATUT_ID
      END,
      EDITED_AT = NOW()
    WHERE ID = $1
 `,
  updateDs: `
    UPDATE FRONT.EIG
    SET
      DEMANDE_SEJOUR_ID = $1,
      DEPARTEMENT=$2,
      DATE=$3,
      EDITED_AT = NOW()
    WHERE
      ID = $4
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
  updateFile: `
    UPDATE front.eig
    SET
      file = $1,
      edited_at = NOW()
    WHERE
      id = $2
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

module.exports.create = async ({
  userId,
  declarationId,
  departement,
  date,
}) => {
  log.i("create - IN");

  const response = await getPool().query(query.create, [
    userId,
    declarationId,
    departement,
    date,
  ]);
  log.d(response);
  const { id } = response.rows[0];
  log.i("create - DONE", { eigId: id });
  return id;
};

module.exports.getById = async ({ eigId }) => {
  log.i("getById - IN");

  const response = await getPool().query(query.getById, [eigId]);
  if (response.rows.length === 0) {
    throw new AppError("EIG non trouvé");
  }
  if (response.rows.length >= 2) {
    throw new AppError("La requete retourne trop d'eig");
  }
  const file = response.rows[0]?.uuid
    ? await getFileMetaData(response.rows[0].uuid)
    : {};

  const rawResult = response.rows[0];

  const decryptedTypes = rawResult?.types.map((type) => {
    const updated = { ...type };
    try {
      // Si `precision` est une string JSON chiffrée
      const precisionParsed = JSON.parse(type.precision);
      updated.precision = decrypt(precisionParsed);
    } catch (e) {
      log.w("Erreur de déchiffrement:", e.message);
      throw new AppError(
        "Erreur de déchiffrement des types. Veuillez vérifier les données.",
      );
    }
    return updated;
  });

  log.d(response);
  log.i("getById - DONE");
  return {
    ...rawResult,
    deroulement: decrypt(response.rows[0].deroulement ?? {}),
    dispositionInformations: decrypt(
      response.rows[0].dispositionInformations ?? {},
    ),
    dispositionRemediation: decrypt(
      response.rows[0].dispositionRemediation ?? {},
    ),
    dispositionVictimes: decrypt(response.rows[0].dispositionVictimes ?? {}),
    file,
    personnel: decrypt(response.rows[0].personnel ?? {}),
    types: (decryptedTypes ?? []).filter((t) => !!t.type),
  };
};

module.exports.getByDsId = async (dsId) => {
  log.i("create - IN");

  const response = await getPool().query(query.get("DS.ID = $1", ""), [dsId]);

  log.d(response);
  log.i("create - DONE");
  return response.rows ?? [];
};

module.exports.getByDsIdAdmin = async (dsId) => {
  log.i("create - IN");

  const response = await getPool().query(
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

  const response = await getPool().query(query.getStatut, [eigId]);
  log.d(response);
  log.i("getStatut - DONE");
  return response.rows?.[0]?.statut ?? null;
};

module.exports.updateDS = async (
  eigId,
  { declarationId, departement, date },
) => {
  log.i("updateDS - IN");

  const response = await getPool().query(query.updateDs, [
    declarationId,
    departement,
    date,
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

  const response = await getPool().query(query.updateEmailAutresDestinataires, [
    emailAutresDestinataires,
    eigId,
  ]);
  log.d(response);
  const { id } = response.rows[0];
  log.i("updateEmailAutresDestinataires - DONE", { eigId: id });
  return id;
};

module.exports.updateFile = async (eigId, { file }) => {
  log.i("updateFile - IN");

  const response = await getPool().query(query.updateFile, [file.uuid, eigId]);
  log.d(response);
  const { id } = response.rows[0];
  log.i("updateFile - DONE", { eigId: id });
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
  const client = await getPool().connect();

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
      params.push(encrypt(precision));
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
  const response = await getPool().query(query.updateRenseignementGeneraux, [
    eigId,
    encrypt(personnel),
    encrypt(deroulement),
    encrypt(dispositionRemediation),
    encrypt(dispositionVictimes),
    encrypt(dispositionInformations),
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
      (CONCAT(pp.prenom,' ',pp.nom_usage) ILIKE $${params.length + 1}
	    OR pm.raison_sociale' ILIKE $${params.length + 1})`);
    params.push(`%${search.organisme}%`);
  }

  if (search?.departement && search.departement.length) {
    searchQuery.push(`eig.departement = $${params.length + 1}`);
    params.push(`${search?.departement}`);
  }

  if (search?.dateRange?.start && search?.dateRange?.end) {
    searchQuery.push(
      `eig.date BETWEEN $${params.length + 1} AND $${params.length + 2}`,
    );
    params.push(`${search.dateRange.start}`);
    params.push(`${search.dateRange.end}`);
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

  const response = await getPool().query(
    queryWithPagination,
    paramsWithPagination,
  );

  if (limit === null || response.rowCount < limit) {
    log.d(response);
    log.i("getByUserId - DONE");
    return {
      eigs: response.rows ?? [],
      total: response.rowCount + parseInt(offset ?? 0),
    };
  }

  const total = (
    await getPool().query(query.getTotal(where, searchQuery), params)
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

module.exports.getIsUserAllowedOrganisme = async (eigId, userId) => {
  const { rowCount } = await getPool().query(query.getIsUserAllowedOrganisme, [
    eigId,
    userId,
  ]);
  return rowCount === 0 ? false : true;
};

module.exports.getTotalToRead = async (userId) => {
  const response = await getPool().query(query.getTotalToRead, [userId]);
  return response.rows[0].count;
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
  const { rows: data } = await getPool().query(query.getEmailByTerCode, [
    terCode,
  ]);
  log.i("getEmailByTerCode - DONE");
  return data.map((m) => m.mail);
};

module.exports.depose = async (eigId) => {
  log.i("depose - IN", eigId);

  await getPool().query(query.depose, [eigId]);
  log.i("getEmailByTerCode - DONE");
  return eigId;
};

module.exports.delete = async ({ eigId }) => {
  log.i("delete EIG - IN");
  const client = await getPool().connect();

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

module.exports.markAsRead = async (eigId, type) => {
  log.i("markAsReadDdets - IN", { eigId });
  if (type === "DREETS") {
    await getPool().query(query.markAsReadDreets, [eigId]);
  }
  if (type === "DDETS") {
    await getPool().query(query.markAsReadDdets, [eigId]);
  }
  log.i("markAsReadDdets - DONE");
  return eigId;
};

module.exports.getAvailableDs = async (organismeId, search) => {
  const { rows: data } = await getPool().query(query.getAvailableDs, [
    search,
    organismeId,
  ]);
  return data;
};

const getByEigId = async (eigId) => {
  try {
    const response = await getPool().query(query.getById, [eigId]);
    return response.rows[0];
  } catch (error) {
    log.w("getByEigId - DONE with error", error);
    if (sentry.enabled) {
      Sentry.captureException(error);
    }
    return null;
  }
};

module.exports.getByEigId = getByEigId;

module.exports.addAsyncEigHistoric = async ({
  data: { oldData, newData },
  eigId,
  userId,
  action,
  userType,
}) => {
  try {
    addHistoric({
      action,
      data: {
        after: newData,
        before: oldData,
      },
      entity: entities.eig,
      entityId: eigId,
      userId,
      userType: userType ?? userTypes.front,
    });
  } catch (error) {
    log.w("addAsyncHistoric - DONE with error", error);
    if (sentry.enabled) {
      Sentry.captureException(error);
    }
  }
};
