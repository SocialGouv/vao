const Sentry = require("@sentry/node");

const { sentry } = require("../config");
const logger = require("../utils/logger");
const pool = require("../utils/pgpool").getPool();
const normalize = require("../utils/normalize");

const {
  applyFilters,
  applyPagination,
  sanitizePaginationParams,
  sanitizeFiltersParams,
} = require("../helpers/queryParams");

const AppError = require("../utils/error");

const { addHistoric } = require("./Tracking");

const { entities } = require("../helpers/tracking");

const log = logger(module.filename);

const query = {
  activate: `
  UPDATE back.users
  SET
    validated = true,
    edited_at = NOW(),
    validated_at = NOW()
  WHERE
    id = $1
  `,
  bindRole: (user, role) => [
    `INSERT INTO back.user_roles (
      use_id,
      rol_id
    ) SELECT $1, id
    FROM back.roles
    WHERE label = $2
    ;`,
    [user, role],
  ],
  connection: `
  UPDATE back.users
  SET
    lastconnection_at = NOW()
  WHERE
    id = $1
  `,
  create: (email, nom, prenom, territoireCode) => [
    `INSERT INTO back.users (
      mail,
      pwd,
      validated,
      deleted,
      nom,
      prenom,
      ter_code,
      created_at,
      enddate
    )
    VALUES (
      $1,
      '',
      false,
      false,
      $2,
      $3,
      $4,
      now(),
      now()
    )
    RETURNING
      id as id
    ;`,
    [normalize(email), nom, prenom, territoireCode],
  ],
  delete: (id, deleted_use_id) => [
    `
      UPDATE back.users
      SET
        deleted = true,
        deleted_use_id = $2,
        deleted_date = now()
      WHERE
        id = $1
      `,
    [id, deleted_use_id],
  ],
  deleteRole: (id) => [
    `
  DELETE FROM back.user_roles
  WHERE use_id = $1;`,
    [id],
  ],
  editPassword: (email, password) => [
    `
      UPDATE back.users
      SET
        pwd = crypt($2, gen_salt('bf')),
        validated = true,
        edited_at = NOW()
      WHERE
        mail = $1
        and deleted = false
      `,
    [normalize(email), password],
  ],
  editStatus: (userId, isBlocked) => [
    `
      UPDATE back.users
      SET
        blocked = $2,
        edited_at = NOW()
      WHERE
        id = $1
      `,
    [userId, isBlocked],
  ],
  get: (
    criterias = {},
    selectQuery = "",
    additionalParamsQuery = "",
    additionalParams = [],
  ) => [
    `
    SELECT
      us.id AS id,
      us.mail AS email,
      us.pwd IS NOT NULL AS "hasPwd",
      us.blocked AS "isBlocked",
      us.nom AS nom,
      us.prenom AS prenom,
      us.validated AS validated,
      us.deleted AS deleted,
      us.deleted_date as deleted_date,
      ud.prenom || ' ' || ud.nom as deletion_user,
      us.created_at as createdat,
      us.validated_at as validatedat,
      us.lastconnection_at as "lastConnectionAt",
      ter.label AS "territoire",
      us.ter_code AS "territoireCode",
      ter.parent_code AS "territoireParent",
      ur.roles,
      reg.label AS "region",
      dep.label AS "departement",
      CASE
        WHEN us.ter_code = 'FRA' THEN 'Nationale'
        WHEN ter.parent_code = 'FRA' THEN 'Régionale'
        ELSE 'Départementale'
      END AS "competence"
      ${selectQuery}
    FROM back.users AS us
    LEFT OUTER JOIN (
      SELECT
        use_id,
        jsonb_agg(
          label
        ) AS roles
        FROM back.user_roles ur
        LEFT OUTER JOIN back.roles ro ON ur.rol_id = ro.id
        GROUP BY use_id
    ) ur ON ur.use_id = us.id
    LEFT OUTER JOIN geo.territoires ter on ter.code = us.ter_code
    LEFT OUTER JOIN geo.territoires dep ON dep.code = us.ter_code AND dep.parent_code <> 'FRA'
    LEFT OUTER JOIN geo.territoires reg ON ((reg.code = ter.code AND ter.parent_code = 'FRA') or (dep.parent_code = reg.code))
    LEFT OUTER JOIN back.users ud on ud.id = us.deleted_use_id
    WHERE 1 = 1
${Object.keys(criterias)
  .map(
    (criteria, i) =>
      `    AND ${criteria} = $${additionalParams.length + i + 1}`,
  )
  .join("")}
    ${additionalParamsQuery}
  `,
    [...additionalParams, ...Object.values(criterias)],
  ],
  getListe: () => `
    SELECT
      us.id AS id,
      us.mail AS email,
      us.nom AS nom,
      us.prenom AS prenom,
      us.validated AS validated,
      us.deleted AS deleted,
      us.created_at as createdAt,
      us.validated_at as validatedAt,
      ter.label AS "territoire",
      us.ter_code AS "territoireCode",
      reg.label AS "region",
      dep.label AS "departement",
      CASE
        WHEN us.ter_code = 'FRA' THEN 'Nationale'
        WHEN ter.parent_code = 'FRA' THEN 'Régionale'
        ELSE 'Départementale'
      END AS "competence"
    FROM back.users AS us
    LEFT OUTER JOIN (
      SELECT
        use_id,
        jsonb_agg(
          label
        ) AS roles
        FROM back.user_roles ur
        LEFT OUTER JOIN back.roles ro ON ur.rol_id = ro.id
        GROUP BY use_id
    ) ur ON ur.use_id = us.id
    LEFT OUTER JOIN geo.territoires ter on ter.code = us.ter_code
    LEFT OUTER JOIN geo.territoires dep ON dep.code = us.ter_code AND dep.parent_code <> 'FRA'
    LEFT OUTER JOIN geo.territoires reg ON ((reg.code = ter.code AND ter.parent_code = 'FRA') or (dep.parent_code = reg.code))
    LEFT OUTER JOIN back.users ud on ud.id = us.deleted_use_id
    WHERE 1 = 1
  `,
  getTotal: (additionalParamsQuery, additionalParams) => [
    `
SELECT
  COUNT(*)
FROM back.users AS us
LEFT JOIN geo.territoires ter
  on ter.code = us.ter_code
WHERE 1 = 1
${additionalParamsQuery}
`,
    additionalParams,
  ],
  listUsersTerritoire: `
    SELECT
      us.mail as email,
      us.blocked as "isBlocked",
      us.nom as nom,
      us.prenom as prenom,
      us.ter_code as "territoireCode",
      terp.label as "territoireLibelle"
    FROM geo.territoires terp
    LEFT JOIN geo.territoires ters ON ters.parent_code = terp.code
    INNER JOIN back.users us ON (terp.code = us.ter_code OR ters.code = us.ter_code) AND us.ter_code <> 'FRA'
    WHERE terp.code =  $1 AND us.validated = true AND us.deleted = false
    GROUP BY 1,2,3,4,5,6
    ORDER BY nom
    `,
  login: `
    SELECT
      us.id as id,
      us.mail as email,
      us.pwd is not null as "hasPwd",
      us.blocked as "isBlocked",
      us.nom as nom,
      us.prenom as prenom,
      us.validated AS validated,
      us.ter_code as "territoireCode",
      ur.roles
    FROM back.users us
    LEFT OUTER JOIN (
      SELECT
        use_id,
        jsonb_agg(
          label
        ) AS roles
        FROM back.user_roles ur
        LEFT OUTER JOIN back.roles ro ON ur.rol_id = ro.id
        GROUP BY use_id
    ) ur ON ur.use_id = us.id
    WHERE
      mail = $1
      AND pwd = crypt($2, CASE
        WHEN pwd = ''
        THEN
          gen_salt('bf')
        ELSE
          pwd
        END
      )
      AND deleted is False
    `,
  undelete: (id) => [
    `
      UPDATE back.users
      SET
        deleted = false
      WHERE
        id = $1
      `,
    [id],
  ],
  update: (id, nom, prenom, territoireCode) => [
    `
      UPDATE back.users
      SET
        nom = $2,
        prenom = $3,
        ter_code = $4,
        deleted = false
      WHERE
        id = $1
      `,
    [id, nom, prenom, territoireCode],
  ],
  updateMe: (id, nom, prenom) => [
    `
      UPDATE back.users
      SET
        nom = $2,
        prenom = $3
      WHERE
        id = $1
      `,
    [id, nom, prenom],
  ],
};

module.exports.create = async ({
  email,
  nom,
  prenom,
  roles,
  territoireCode,
}) => {
  log.i("create - IN", { email });

  // Test de l'existance d'un compte avec la même adresse mail non désactivé
  const response = await pool.query(
    ...query.get({ "us.mail": normalize(email) }),
  );
  if (response.rows.length !== 0) {
    log.w("create - DONE - Utilisateur BO déjà existant");
    throw new AppError("Utilisateur déjà existant", {
      name: "UserAlreadyExists",
    });
  }

  // Création du compte en base de données
  const userId = await pool.query(
    ...query.create(email, nom, prenom, territoireCode),
  );

  const [user] = userId.rows;

  // Création des rôles en base de données
  for (const role of roles) {
    await pool.query(...query.bindRole(user.id, role));
  }
  // le role eig est attribué par default a tous les utilisateurs back
  await pool.query(...query.bindRole(user.id, "eig"));

  log.i("create - DONE", { userId });

  return { code: "CreationCompte", user };
};

module.exports.updateMe = async (id, { nom, prenom }) => {
  log.i("update - IN", { id });
  if (!id) {
    throw new AppError("Paramètre manquant ou erroné de patate", {
      statusCode: 500,
    });
  }
  const { rowCount } = await pool.query(...query.updateMe(id, nom, prenom));

  if (rowCount === 0) {
    log.d("update - DONE - Utilisateur BO inexistant");
    throw new AppError("Utilisateur déjà inexistant", {
      name: "UserNotFound",
    });
  }
  log.i("updateMe - DONE");
  return { code: "MajCompte" };
};

module.exports.update = async (
  id,
  { nom, prenom, roles, territoireCode, deleted },
  deleted_use_id,
) => {
  log.i("update - IN", { id });
  if (!id) {
    throw new AppError("Paramètre manquant", {
      statusCode: 500,
    });
  }
  // Mise à jour du compte en base de données
  const { rowCount } = await pool.query(
    ...query.update(id, nom, prenom, territoireCode),
  );

  if (rowCount === 0) {
    log.d("update - DONE - Utilisateur BO inexistant");
    throw new AppError("Utilisateur déjà inexistant", {
      name: "UserNotFound",
    });
  }
  // Suppression logique du compte
  if (deleted) await pool.query(...query.delete(id, deleted_use_id));

  // Suppression des roles de l'utilisateur
  await pool.query(...query.deleteRole(id));

  // Création des rôles en base de données
  for (const role of roles) {
    await pool.query(...query.bindRole(id, role));
  }

  if (!roles.includes("eig")) {
    // le role eig est attribué par default a tous les utilisateurs back
    await pool.query(...query.bindRole(id, "eig"));
  }

  log.i("update - DONE");
  return { code: "MajCompte" };
};

module.exports.editPassword = async (email, password) => {
  log.i("editPassword - IN", { email });

  if (!email || !password) {
    throw new AppError("Paramètre manquant", {
      statusCode: 500,
    });
  }

  const { rowCount } = await pool.query(...query.editPassword(email, password));
  if (rowCount === 0) {
    log.d("editPassword - DONE - Utilisateur BO inexistant");
    throw new AppError("Utilisateur non trouvé", {
      name: "UserNotFound",
    });
  }

  log.i("editPassword - DONE");
};

module.exports.editStatus = async (userId, isBlocked) => {
  log.i("editStatus - IN", { isBlocked, userId });
  await pool.query(...query.editStatus(userId, isBlocked));
  log.i("editStatus - DONE");
};

module.exports.activate = async (email) => {
  log.i("active - IN", { email });
  const response = await pool.query(
    ...query.get({ "us.mail": normalize(email) }),
  );
  if (response.rowCount === 0) {
    throw new AppError("Utilisateur non trouvé", { name: "UserNotFound" });
  }
  const user = response.rows[0];
  log.d("activate", { user });
  if (user.validate) {
    throw new AppError("Utilisateur déjà actif", {
      name: "UserAlreadyVerified",
    });
  }
  // Activation du compte
  await pool.query(query.activate, [user.id]);

  // TODO: remove
  const responseWithUpdate = await pool.query(
    ...query.get({ "us.mail": normalize(email) }),
  );
  const [userUpdated] = responseWithUpdate.rows;

  log.i("active - DONE", { userUpdated });
  return userUpdated;
};

module.exports.read = async (
  { limit, offset, sortBy, sortDirection = "ASC", search } = {},
  territoireCode,
) => {
  //  TODO : create the logic (here or in the service) to get the department of the admin.
  //  For me, the list of demandes that are goven to the admin are the list of all demands of the department

  log.w("read - IN", { search });
  let searchQuery = "";
  let territoireSearchParamId = "";
  const searchParams = [];
  // Search management
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
  if (
    search?.territoire &&
    search?.territoire !== "FRA" &&
    search?.territoire.length
  ) {
    searchQuery += `   AND (
      unaccent(ter.label) ILIKE unaccent($${searchParams.length + 1})
      OR ter.code ILIKE $${searchParams.length + 1}
      OR ter.parent_code IN (SELECT code FROM matched_elements)
    )\n`;
    territoireSearchParamId = searchParams.length + 1;
    searchParams.push(`%${search.territoire}%`);
  }

  // Filtre utilisé pour rechercher tous les users pour un territoire et ses enfants
  if (
    search?.territoireParent &&
    search?.territoireParent !== "FRA" &&
    search.territoireParent.length
  ) {
    searchQuery += `   AND (
      ter.code = $${searchParams.length + 1}
      OR ter.parent_code = $${searchParams.length + 1}
    )\n`;
    territoireSearchParamId = searchParams.length + 1;
    searchParams.push(`%${search.territoireParent}%`);
  }

  if (search?.statut === "validated") {
    searchQuery += `AND us.validated = true\n`;
  }
  if (search?.statut === "notValidated") {
    searchQuery += `AND us.validated = false\n`;
  }
  if (search?.statut === "deleted") {
    searchQuery += `AND us.deleted = true\n`;
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

  let selectQuery = "";
  if (territoireCode && territoireCode !== "FRA") {
    selectQuery = `,COALESCE((ter.code = $${searchParams.length + additionalParams.length + 1} OR ter.parent_code = $${searchParams.length + additionalParams.length + 1}), false)`;
    additionalParams.push(`${territoireCode}`);
  } else {
    selectQuery = `,$${searchParams.length + additionalParams.length + 1}`;
    additionalParams.push(`true`);
  }
  selectQuery += ` AS "editable"`;

  log.d(
    "read",
    selectQuery + "\n " + searchQuery + "\n " + additionalQueryParts,
  );
  log.d("read", [...searchParams, ...additionalParams]);

  const queryPrepared = query.get(
    undefined,
    selectQuery,
    searchQuery + "\n   " + additionalQueryParts,
    [...searchParams, ...additionalParams],
  );

  const territoirePreQuery = `
    WITH matched_elements AS (
      SELECT code
      FROM geo.territoires
      WHERE unaccent(label) ILIKE unaccent($${territoireSearchParamId})
      OR code ILIKE $${territoireSearchParamId}
    )\n`;

  const response = await pool.query(
    `${territoireSearchParamId ? territoirePreQuery : ""}
    ${queryPrepared[0]}`,
    queryPrepared[1],
  );

  const preparedTotalQuery = query.getTotal(searchQuery, searchParams);
  const total = await pool.query(
    `${territoireSearchParamId ? territoirePreQuery : ""}
    ${preparedTotalQuery[0]}`,
    preparedTotalQuery[1],
  );

  log.i("read - DONE");
  return {
    total: total.rows[0].count,
    users: response.rows,
  };
};

module.exports.getListe = async (queryParams, territoireCode) => {
  const titles = [
    {
      key: "us.nom",
      queryKey: "nom",
      sortEnabled: true,
      type: "default",
    },
    {
      key: "us.prenom",
      queryKey: "prenom",
      sortEnabled: true,
      type: "default",
    },
    {
      key: "us.mail",
      queryKey: "email",
      sortEnabled: true,
      type: "default",
    },
    {
      key: "us.territoire",
      query: (index, value) => {
        if (value === "FRA") {
          return {
            query: "",
            queryParams: [],
          };
        }
        return {
          query: `
            (unaccent(ter.label) ILIKE unaccent('%' || $${index} || '%')
            OR ter.code ILIKE '%' || $${index} || '%')
          `,
          queryParams: [value],
        };
      },
      queryKey: "territoire",
      sortEnabled: true,
      type: "custom",
    },
    {
      key: "us.validated",
      queryKey: "validated",
      sortEnabled: true,
      type: "default",
    },
    {
      key: "us.editable",
      queryKey: "editable",
      sortEnabled: true,
      type: "default",
    },
    {
      query: (index, value) => {
        const status = {
          disabled: () => " us.deleted = true",
          notValided: () => "us.validated = false",
          valied: () => "us.validated = true",
        };
        return {
          query: Object.keys(status).includes(value) ? status[value]() : "",
          queryParams: [],
        };
      },
      queryKey: "statut",
      type: "custom",
    },
  ];
  const filterParams = sanitizeFiltersParams(queryParams, titles);
  let queryGet = query.getListe();
  const params = [];
  if (territoireCode !== "FRA") {
    queryGet = `
      ${queryGet}
      AND (ter.code = $1 OR ter.parent_code = $1)
    `;
    params.push(territoireCode);
  }
  const filterQuery = applyFilters(queryGet, params, filterParams);
  const { limit, offset, sort } = sanitizePaginationParams(queryParams, titles);
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

module.exports.readTerritoires = async (territoireParent) => {
  log.i("readTerritoires - IN", territoireParent);
  const userTerritoire = await pool.query(query.listUsersTerritoire, [
    territoireParent,
  ]);
  log.i("readTerritoires - DONE");
  return {
    total: userTerritoire.rows.count,
    users: userTerritoire.rows,
  };
};

module.exports.readOne = async (id, territoireCode) => {
  log.i("readOne - IN", { id });

  if (!id) {
    throw new AppError("Paramètre manquant", {
      statusCode: 500,
    });
  }

  const selectParams = [];
  let selectQuery = "";
  if (territoireCode && territoireCode !== "FRA") {
    selectQuery = `,COALESCE((ter.code = $${selectParams.length + 1} OR ter.parent_code = $${selectParams.length + 1}), false)`;
    selectParams.push(`${territoireCode}`);
  } else {
    selectQuery = `,$${selectParams.length + selectParams.length + 1}`;
    selectParams.push(`true`);
  }
  selectQuery += ` AS "editable"`;

  const { rowCount, rows: users } = await pool.query(
    ...query.get({ "us.id": id }, selectQuery, undefined, selectParams),
  );

  if (rowCount === 0) {
    log.d("readOne - DONE - Utilisateur BO inexistant");
    throw new AppError("Utilisateur déjà inexistant", {
      name: "UserNotFound",
    });
  }

  log.i("readOne - DONE");
  return users[0];
};

module.exports.readOneByMail = async (email) => {
  log.i("readOne - IN", { email });

  if (!email) {
    throw new AppError("Paramètre manquant", {
      statusCode: 500,
    });
  }

  const { rowCount, rows: users } = await pool.query(
    ...query.get({ "us.mail": normalize(email) }),
  );

  if (rowCount === 0) {
    log.d("readOne - DONE - Utilisateur BO inexistant");
    throw new AppError("Utilisateur inexistant", {
      name: "UserNotFound",
    });
  }

  log.i("readOne - DONE");
  return users[0];
};

module.exports.login = async ({ email, password }) => {
  log.i("login - IN", { email });
  const user = await pool.query(query.login, [normalize(email), password]);
  if (user.rowCount === 0) {
    return null;
  } else {
    await pool.query(query.connection, [user.rows[0].id]);
  }
  log.i("login - DONE");
  return user.rows[0];
};

const getByUserId = async (userId) => {
  try {
    const params = {
      "us.id": userId,
    };
    const response = await pool.query(...query.get(params));
    return response.rows[0];
  } catch (error) {
    log.w("getByUserId - DONE with error", error);
    if (sentry.enabled) {
      Sentry.captureException(error);
    }
    return null;
  }
};

module.exports.getByUserId = getByUserId;

const addAsyncUserHistoric = async ({
  data: { oldData, newData },
  boUserId,
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
      entity: entities.userBack,
      entityId: boUserId,
      userId,
      userType,
    });
  } catch (error) {
    log.w("addAsyncHistoric - DONE with error", error);
    if (sentry.enabled) {
      Sentry.captureException(error);
    }
  }
};

module.exports.addAsyncUserHistoric = addAsyncUserHistoric;
