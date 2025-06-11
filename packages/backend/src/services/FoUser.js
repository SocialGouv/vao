const logger = require("../utils/logger");
const pool = require("../utils/pgpool").getPool();
const normalize = require("../utils/normalize");

const {
  sanitizePaginationParams,
  sanitizeFiltersParams,
  applyFilters,
  applyPagination,
} = require("../helpers/queryParams");

const AppError = require("../utils/error");

const log = logger(module.filename);

const query = {
  bindRole: (user, role) => [
    `INSERT INTO front.user_roles (
      use_id,
      rol_id
    ) SELECT $1, id
    FROM front.roles
    WHERE label = $2
    ;`,
    [user, role],
  ],
  deleteRoles: `
    DELETE FROM front.user_roles
    WHERE use_id = $1
    `,
  get: (searchQuery = "", additionalParamsQuery = "", params = []) => [
    `
    SELECT
      us.id AS id,
      us.mail AS email,
      us.nom AS nom,
      us.prenom AS prenom,
      us.status_code AS statut,
      us.created_at AS "dateCreation",
      us.lastconnection_at as "lastConnectionAt",
      org.id AS "organismeId",
      org.type_organisme AS "typeOrganisme",
      STRING_AGG(DISTINCT COALESCE(pm.siret, pp.siret), ', ') AS siret,
      pm.siren AS siren,
      pm.raison_sociale AS "raisonSociale",
      count(CASE WHEN ds.statut <> 'BROUILLON' THEN ds.id ELSE NULL END) AS "nombreDeclarations"
    FROM front.users AS us
      LEFT OUTER JOIN front.user_organisme AS uo ON uo.use_id = us.id
      LEFT OUTER JOIN front.organismes AS org ON org.id = uo.org_id
      LEFT JOIN front.personne_morale pm ON pm.organisme_id = org.id
      LEFT JOIN front.personne_physique pp ON pp.organisme_id = org.id
      LEFT OUTER JOIN front.demande_sejour AS ds ON ds.organisme_id = org.id
    WHERE 1 = 1
    ${searchQuery}
    GROUP BY(us.id,us.mail,us.nom,us.prenom,us.status_code,org.id,org.type_organisme,siren,"raisonSociale","organismeId")
    ${additionalParamsQuery}
    `,
    [...params],
  ],
  getByOrganismeId: () =>
    ` SELECT * FROM (
      (
        SELECT
          u.id AS "userId",
          u.mail AS email,
          u.nom AS nom,
          u.prenom AS prenom,
          u.telephone AS telephone,
          u.status_code AS statut,
          u.created_at AS "dateCreation",
          u.lastconnection_at as "lastConnectionAt",
          CASE 
            WHEN o.type_organisme = 'personne_morale' THEN pm.siege_social 
            ELSE true
          END AS "siegeSocial",
          COALESCE(pm.adresse, pp.adresse_siege_label) AS "Adresse"
        FROM front.users AS u
          LEFT OUTER JOIN front.user_organisme AS uo ON uo.use_id = u.id
          LEFT OUTER JOIN front.organismes AS o ON o.id = uo.org_id
          LEFT JOIN front.personne_morale pm ON pm.organisme_id = o.id
          LEFT JOIN front.personne_physique pp ON pp.organisme_id = o.id
        WHERE o.id = ANY ($1)
      )
      UNION
      (
        SELECT
          u.id AS "userId",
          u.mail AS email,
          u.nom AS nom,
          u.prenom AS prenom,
          u.telephone AS telephone,
          u.status_code AS statut,
          u.created_at AS "dateCreation",
          u.lastconnection_at as "lastConnectionAt",
          CASE 
            WHEN pm.siret = u.siret THEN pm.siege_social 
            ELSE false
          END AS "siegeSocial",
          COALESCE(CONCAT(etab.adresse,' ',etab.code_postal,' ',etab.commune), pm.adresse, pp.adresse_siege_label) AS "Adresse"
        FROM front.users AS u
          LEFT JOIN front.opm_etablissements etab ON etab.siret = u.siret
          LEFT JOIN front.personne_morale pm ON pm.siege_social = true AND ((pm.siren = substr(u.siret,1,9) AND etab.siret = u.siret) OR pm.siret = u.siret) AND pm.organisme_id = ANY ($1)
          LEFT JOIN front.personne_physique pp ON pp.siret = u.siret AND pp.organisme_id = ANY ($1)
          INNER JOIN front.organismes AS o ON o.id = pm.organisme_id OR o.id = pp.organisme_id
        WHERE u.id NOT IN (SELECT use_id FROM front.user_organisme uo WHERE uo.use_id = u.id)
        GROUP BY 1,2,3,4,5,6,7,8,9,10
      )
    ) AS Resultat
    WHERE 1 = 1
    `,
  getByToValidateByBo: `
    SELECT
      u.id AS "userId",
      u.mail AS email,
      u.nom AS nom,
      u.prenom AS prenom,
      u.telephone AS telephone,
      u.status_code AS statut,
      u.siret AS siret,
      u.created_at AS "dateCreation",
      u.lastconnection_at as "lastConnectionAt"
    FROM front.users AS u
    WHERE u.ter_code = $1
    AND u.status_code = 'NEED_SIRET_VALIDATION'
    AND u.siret not in (SELECT opme.siret FROM front.opm_etablissements opme WHERE opme.siret = u.siret)
  `,
  // uc : User connected  / uu : User recherché
  getIsUserSameOrganismeOtherUser: `
    SELECT 
      SUM(total_count) AS count
    FROM (
        SELECT count(*) AS total_count
        FROM front.user_organisme uco 
        INNER JOIN front.personne_morale ucpm ON ucpm.organisme_id = uco.org_id AND siege_social = true
        INNER JOIN front.personne_morale uupm ON uupm.siren = ucpm.siren
        INNER JOIN front.user_organisme uuo ON uuo.org_id = uupm.organisme_id
        WHERE uco.use_id = $1 AND uuo.use_id = $2
      UNION ALL
        SELECT count(*) AS total_count
        FROM front.user_organisme uco 
        INNER JOIN front.personne_morale ucpm ON ucpm.organisme_id = uco.org_id AND siege_social = true
        INNER JOIN front.users uu ON ucpm.siren = substr(uu.siret,1,9)
        WHERE uco.use_id = $1 AND uu.id = $2
    ) AS counts;
  `,
  getMailUserOrganismeId: `
    SELECT mail FROM front.users u
    INNER JOIN front.user_organisme uo ON uo.org_id = $1 AND uo.use_id = u.id`,
  getOne: `
        SELECT
      u.id AS "userId",
      u.mail AS email,
      u.nom AS nom,
      u.prenom AS prenom,
      u.telephone AS telephone,
      u.status_code AS statut,
      u.created_at AS "dateCreation",
      u.lastconnection_at as "lastConnectionAt",
      (
          SELECT COALESCE(jsonb_agg(r.label), '[]'::jsonb)
          FROM front.roles r
          INNER JOIN front.user_roles ur ON ur.rol_id = r.id
          WHERE ur.use_id = u.id
        ) AS "roles",
      o.type_organisme AS "typeOrganisme",
      CASE 
        WHEN o.type_organisme = 'personne_morale' THEN pm.siege_social 
        ELSE true
      END AS "siegeSocial"
    FROM front.users AS u
    INNER JOIN front.user_organisme uo ON uo.use_id = u.id
    INNER JOIN front.organismes o ON o.id = uo.org_id
    LEFT JOIN front.personne_morale pm ON pm.organisme_id = uo.org_id
    WHERE u.id = $1
    `,
  getRolesByUserId: `
    SELECT r.label
    FROM front.roles r
    INNER JOIN front.user_roles ur ON ur.rol_id = r.id
    WHERE ur.use_id = $1
  `,
  getTotal: (additionalParamsQuery, additionalParams) => [
    `
      SELECT
        COUNT (DISTINCT us.id)
      FROM front.users AS us
        LEFT OUTER JOIN front.user_organisme AS uo ON uo.use_id = us.id
        LEFT OUTER JOIN front.organismes AS org ON org.id = uo.org_id
        LEFT JOIN front.personne_morale pm ON pm.organisme_id = org.id
        LEFT JOIN front.personne_physique pp ON pp.organisme_id = org.id
        LEFT OUTER JOIN front.demande_sejour AS ds ON ds.organisme_id = org.id
      WHERE 1 = 1
    ${additionalParamsQuery}
    `,
    additionalParams,
  ],
  getUserOragnisme: `SELECT org_id as "organismeId" FROM front.user_organisme WHERE use_id = $1`,
  updateUserStatus:
    "UPDATE front.users SET status_code = $2, motif_refus = $3, traite_compte_back_use_id = $4, traite_compte_front_use_id = $5, treated_at = now() WHERE id = $1 RETURNING *",
};
module.exports.getByOrganismeId = async (organismesId, queryParams) => {
  const titles = [
    {
      key: '"siegeSocial"',
      queryKey: "siegeSocial",
      sortEnabled: true,
      type: "boolean",
    },
    {
      key: "nom",
      queryKey: "nom",
      sortEnabled: true,
      type: "default",
    },
    {
      key: "prenom",
      queryKey: "prenom",
      sortEnabled: true,
      type: "default",
    },
    {
      key: '"email"',
      queryKey: "email",
      sortEnabled: true,
      type: "default",
    },
    {
      key: '"dateCreation"',
      queryKey: "dateCreation",
      sortEnabled: true,
      sortType: "date",
      type: "default",
    },
    {
      key: "statut",
      queryKey: "statut",
      sortEnabled: true,
      type: "default",
    },
  ];
  const { limit, offset, sort } = sanitizePaginationParams(
    queryParams,
    titles,
    {
      sortBy: "nom",
      sortDirection: "DESC",
    },
  );
  const filterParams = sanitizeFiltersParams(queryParams, titles);
  const queryGet = query.getByOrganismeId();
  const filterQuery = applyFilters(queryGet, [organismesId], filterParams);
  const paginatedQuery = applyPagination(
    filterQuery.query,
    filterQuery.params,
    limit,
    offset,
    sort,
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

module.exports.read = async ({
  limit,
  offset,
  sortBy,
  sortDirection = "ASC",
  search,
} = {}) => {
  log.i("read - IN", { search });
  let searchQuery = "";
  const searchParams = [];

  // Search management
  if (search?.organisme_id && search.organisme_id.length) {
    searchQuery += `   AND org.id = $${searchParams.length + 1}\n`;
    searchParams.push(`${search.organisme_id}`);
  }
  if (search?.nom && search.nom.length) {
    searchQuery += `   AND unaccent(us.nom) ILIKE unaccent($${searchParams.length + 1})\n`;
    searchParams.push(`%${search.nom}%`);
  }
  if (search?.prenom && search.prenom.length) {
    searchQuery += `   AND unaccent(us.prenom) ILIKE unaccent($${searchParams.length + 1})\n`;
    searchParams.push(`%${search.prenom}%`);
  }
  if (search?.email && search.email.length) {
    searchQuery += `   AND us.mail ILIKE $${searchParams.length + 1}\n`;
    searchParams.push(`%${normalize(search.email)}%`);
  }
  if (search?.siret && search.siret.length) {
    searchQuery += `   AND (pm.siret ILIKE $${searchParams.length + 1} OR pp.siret ILIKE $${searchParams.length + 1})\n`;
    searchParams.push(`%${normalize(search.siret)}%`);
  }
  if (search?.organisme && search.organisme.length) {
    searchQuery += `AND (
      pm.raisonSociale ILIKE $${searchParams.length + 1}
      OR unaccent(pp.prenom) ILIKE unaccent($${searchParams.length + 1})
      OR unaccent(pp.nomUsage) ILIKE unaccent($${searchParams.length + 1})
      )`;
    searchParams.push(`%${search.organisme}%`);
  }

  let additionalQueryParts = "";
  const additionalParams = [];

  // Order management
  if (sortBy && sortDirection) {
    additionalQueryParts += `
    ORDER BY "${sortBy}" ${sortDirection}
    `;
  } else {
    additionalQueryParts += "\n ORDER BY nom, prenom";
  }

  // Pagination management
  if (limit != null && offset != null) {
    additionalQueryParts += `
    OFFSET $${searchParams.length + additionalParams.length + 1}
    LIMIT $${searchParams.length + additionalParams.length + 2}
    `;
    additionalParams.push(offset, limit);
  }

  const response = await pool.query(
    ...query.get(searchQuery, additionalQueryParts, [
      ...searchParams,
      ...additionalParams,
    ]),
  );

  const total = await pool.query(...query.getTotal(searchQuery, searchParams));

  log.i("read - DONE");
  return {
    total: total.rows[0].count,
    users: response.rows,
  };
};

module.exports.getByToValidateByBo = async (terCode) => {
  log.i("getByToValidateByBo - IN", { terCode });
  if (!terCode) {
    throw new AppError("Paramètre manquant", {
      statusCode: 500,
    });
  }
  const { rowCount, rows } = await pool.query(query.getByToValidateByBo, [
    terCode,
  ]);
  log.i("getByToValidateByBo - DONE");
  return { total: rowCount, users: rows };
};

module.exports.getIsUserSameOrganismeOtherUser = async (
  userIdConnected,
  userIdSearch,
) => {
  log.i("getIsUserSameOrganismeOtherUser - IN", {
    userIdConnected,
    userIdSearch,
  });
  if (!userIdConnected && !userIdSearch) {
    throw new AppError("Paramètre manquant", {
      statusCode: 500,
    });
  }
  const total = await pool.query(query.getIsUserSameOrganismeOtherUser, [
    userIdConnected,
    userIdSearch,
  ]);
  log.i("getIsUserSameOrganismeOtherUser - DONE");
  return total.rows[0].count >= 0;
};
module.exports.readOne = async (userId) => {
  log.i("readOne - IN", { userId });
  if (!userId) {
    throw new AppError("Paramètre manquant", {
      statusCode: 500,
    });
  }
  const { rowCount, rows: users } = await pool.query(query.getOne, [userId]);
  if (rowCount === 0) {
    log.d("readOne - DONE - Utilisateur FO inexistant");
    throw new AppError("Utilisateur déjà inexistant", {
      name: "UserNotFound",
    });
  }

  log.i("readOne - DONE");
  return users[0];
};

module.exports.getUserOrganisme = async (userId) => {
  const { rows } = await pool.query(query.getUserOragnisme, [userId]);
  return rows[0]?.organismeId ?? null;
};

module.exports.getMailUserOrganismeId = async (organismeId) => {
  const { rows } = await pool.query(query.getMailUserOrganismeId, [
    organismeId,
  ]);
  return rows ?? [];
};

module.exports.getRolesByUserId = async (userId) => {
  log.i("getRolesByUserId - IN");

  const response = await pool.query(query.getRolesByUserId, [userId]);
  log.d(response);
  log.i("getRolesByUserId - DONE");
  return response?.rows ?? null;
};

module.exports.updateRoles = async (userId, roles) => {
  log.i("updateRoles - IN");
  await pool.query(query.deleteRoles, [userId]);
  for (const role of roles) {
    await pool.query(...query.bindRole(userId, role));
  }
  log.i("update - DONE");
  return { code: "MajCompte" };
};

module.exports.updateStatus = async (
  userId,
  status,
  motif,
  userBackId,
  userFrontId,
) => {
  log.i("updateStatus - IN");
  const response = await pool.query(query.updateUserStatus, [
    userId,
    status,
    motif,
    userBackId,
    userFrontId,
  ]);
  log.i("updateStatus - DONE");
  return { user: response.rows[0] };
};
