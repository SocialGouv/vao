const logger = require("../utils/logger");
const { getPool } = require("../utils/pgpool");

const {
  sanitizePaginationParams,
  sanitizeFiltersParams,
  applyFilters,
  applyPagination,
} = require("../helpers/queryParams");
const { processQuery } = require("../helpers/queryParams");

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
      LEFT JOIN front.personne_morale pm ON pm.organisme_id = org.id AND pm.current = TRUE
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
          LEFT JOIN front.personne_morale pm ON pm.organisme_id = o.id AND pm.current = TRUE
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
          LEFT JOIN front.personne_morale pm ON pm.siege_social = true AND ((pm.siren = substr(u.siret,1,9) AND etab.siret = u.siret) OR pm.siret = u.siret) AND pm.organisme_id = ANY ($1) AND pm.current = TRUE
          LEFT JOIN front.personne_physique pp ON pp.siret = u.siret AND pp.organisme_id = ANY ($1)
          INNER JOIN front.organismes AS o ON o.id = pm.organisme_id OR o.id = pp.organisme_id
        WHERE u.id NOT IN (SELECT use_id FROM front.user_organisme uo WHERE uo.use_id = u.id)
        GROUP BY 1,2,3,4,5,6,7,8,9,10
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
          COALESCE(CONCAT(etab.adresse, ' ', etab.code_postal, ' ', etab.commune), pm.adresse) AS "Adresse"
        FROM front.users AS u
          LEFT JOIN front.personne_morale pm ON pm.siege_social = false AND pm.siret = u.siret AND pm.organisme_id = ANY ($1) AND pm.current = TRUE
          LEFT JOIN front.opm_etablissements etab ON etab.personne_morale_id = pm.id
          INNER JOIN front.organismes AS o ON o.id = pm.organisme_id
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

  getIsLastUserOrganisme: `
    SELECT COUNT(*)
    FROM front.users u
    INNER JOIN front.user_organisme uo ON uo.use_id = u.id
    WHERE uo.org_id= (
        SELECT org_id 
        FROM front.user_organisme 
        WHERE use_id = $1
    )
    AND u.status_code = 'VALIDATED';  
  `,

  // uc : User connected  / uu : User recherché
  // On vérifier que l'organisme de l'utilisateur connecté est le même que celui de l'utilisateur recherché
  // l'utilisateur connecté doit être un utilisateur de l'organisme principal
  // l'utilisateur recherché doit être un utilisateur de l'organisme principal ou un utilisateur de l'organisme secondaire
  getIsUserSameOrganismeOtherUser: `
    SELECT 
      SUM(total_count) AS count
    FROM (
        SELECT count(*) AS total_count
        FROM front.user_organisme uco 
        INNER JOIN front.personne_morale ucpm ON ucpm.organisme_id = uco.org_id AND siege_social = true AND ucpm.current = TRUE
        INNER JOIN front.personne_morale uupm ON uupm.siren = ucpm.siren AND uupm.current = TRUE
        INNER JOIN front.user_organisme uuo ON uuo.org_id = uupm.organisme_id
        WHERE uco.use_id = $1 AND uuo.use_id = $2
      UNION ALL
        SELECT count(*) AS total_count
        FROM front.user_organisme uco 
        INNER JOIN front.personne_morale ucpm ON ucpm.organisme_id = uco.org_id AND siege_social = true AND ucpm.current = TRUE
        INNER JOIN front.users uu ON ucpm.siren = substr(uu.siret,1,9)
        WHERE uco.use_id = $1 AND uu.id = $2
    ) AS counts;
  `,

  getList: () => `
    WITH liste AS (
      SELECT
        us.id AS id,
        us.mail AS email,
        us.nom AS nom,
        us.prenom AS prenom,
        us.status_code AS statut,
        us.created_at AS "dateCreation",
        us.lastconnection_at AS "lastConnectionAt",
        org.id AS "organismeId",
        org.type_organisme AS "typeOrganisme",
        STRING_AGG(DISTINCT COALESCE(pm.siret, pp.siret), ', ') AS siret,
        pm.siren AS siren,
        STRING_AGG(DISTINCT COALESCE(pm.raison_sociale, pp.nom_usage), ', ') AS "raisonSociale",
        COUNT(CASE WHEN ds.statut <> 'BROUILLON' THEN ds.id END) AS "nombreDeclarations"
      FROM front.users AS us
        LEFT JOIN front.user_organisme AS uo ON uo.use_id = us.id
        LEFT JOIN front.organismes AS org ON org.id = uo.org_id
        LEFT JOIN front.personne_morale pm ON pm.organisme_id = org.id AND pm.current = TRUE
        LEFT JOIN front.personne_physique pp ON pp.organisme_id = org.id
        LEFT JOIN front.demande_sejour AS ds ON ds.organisme_id = org.id
      GROUP BY us.id, us.mail, us.nom, us.prenom, us.status_code, org.id, org.type_organisme, pm.siren
    )
    SELECT *
    FROM liste
    WHERE 1=1
  `,
  getMailUserOrganismeId: `
    SELECT mail FROM front.users u
    INNER JOIN front.user_organisme uo ON uo.org_id = $1 AND uo.use_id = u.id
    WHERE u.status_code = 'VALIDATED'`,
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
    LEFT JOIN front.personne_morale pm ON pm.organisme_id = uo.org_id AND pm.current = TRUE
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
        LEFT JOIN front.personne_morale pm ON pm.organisme_id = org.id AND pm.current = TRUE
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
    getPool().query(paginatedQuery.query, paginatedQuery.params),
    getPool().query(paginatedQuery.countQuery, paginatedQuery.countQueryParams),
  ]);
  return {
    rows: result[0].rows,
    total: parseInt(result[1].rows[0].total, 10),
  };
};

const userTitles = [
  {
    key: `"organiseId"`,
    queryKey: "organisme_id",
    sortEnabled: false,
    type: "default",
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
    key: "email",
    queryKey: "email",
    sortEnabled: true,
    type: "default",
  },
  {
    key: "siret",
    queryKey: "siret",
    sortEnabled: false,
    type: "default",
  },
  {
    key: `"raisonSociale"`,
    queryKey: "organisme",
    sortEnabled: true,
    type: "default",
  },
  {
    key: `"raisonSociale"`,
    queryKey: "raisonSociale",
    sortEnabled: true,
    type: "default",
  },
  {
    key: `"nombreDeclarations"`,
    queryKey: "nombreDeclarations",
    sortEnabled: true,
    sortType: "number",
    type: "number",
  },
  {
    key: "statut",
    queryKey: "statut",
    sortEnabled: true,
    type: "default",
  },
  {
    key: `"dateCreation"`,
    queryKey: "dateCreation",
    sortEnabled: true,
    sortType: "date",
    type: "default",
  },
];

module.exports.read = async (queryParams = {}) => {
  log.i("read - IN", queryParams);

  const paginatedQuery = processQuery(
    query.getList,
    [],
    userTitles,
    queryParams,
    {
      sortBy: "nom",
      sortDirection: "ASC",
    },
    "",
  );
  const result = await Promise.all([
    getPool().query(paginatedQuery.query, paginatedQuery.params),
    getPool().query(paginatedQuery.countQuery, paginatedQuery.countQueryParams),
  ]);
  log.i("read - DONE");
  return {
    total: parseInt(result[1].rows[0].total, 10),
    users: result[0].rows,
  };
};

module.exports.getByToValidateByBo = async (terCode) => {
  log.i("getByToValidateByBo - IN", { terCode });
  if (!terCode) {
    throw new AppError("Paramètre manquant", {
      statusCode: 500,
    });
  }
  const { rowCount, rows } = await getPool().query(query.getByToValidateByBo, [
    terCode,
  ]);
  log.i("getByToValidateByBo - DONE");
  return { total: rowCount, users: rows };
};
module.exports.getIsLastUserOrganisme = async (userId) => {
  const response = await getPool().query(query.getIsLastUserOrganisme, [
    userId,
  ]);
  log.i("getIsLastUserOrganisme - DONE");
  return response.rows[0].count <= 1;
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
  const total = await getPool().query(query.getIsUserSameOrganismeOtherUser, [
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
  const { rowCount, rows: users } = await getPool().query(query.getOne, [
    userId,
  ]);
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
  const { rows } = await getPool().query(query.getUserOragnisme, [userId]);
  return rows[0]?.organismeId ?? null;
};

module.exports.getMailUserOrganismeId = async (organismeId) => {
  const { rows } = await getPool().query(query.getMailUserOrganismeId, [
    organismeId,
  ]);
  return rows ?? [];
};

module.exports.getRolesByUserId = async (userId) => {
  log.i("getRolesByUserId - IN");

  const response = await getPool().query(query.getRolesByUserId, [userId]);
  log.d(response);
  log.i("getRolesByUserId - DONE");
  return response?.rows ?? null;
};

module.exports.updateRoles = async (userId, roles) => {
  log.i("updateRoles - IN");
  await getPool().query(query.deleteRoles, [userId]);
  for (const role of roles) {
    await getPool().query(...query.bindRole(userId, role));
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
  const response = await getPool().query(query.updateUserStatus, [
    userId,
    status,
    motif,
    userBackId,
    userFrontId,
  ]);
  log.i("updateStatus - DONE");
  return { user: response.rows[0] };
};
