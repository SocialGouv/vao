const logger = require("../utils/logger");
const pool = require("../utils/pgpool").getPool();
const normalize = require("../utils/normalize");

const AppError = require("../utils/error");

const log = logger(module.filename);

const query = {
  activate: `
  UPDATE back.users
  SET 
    validated = true,
    edited_at = NOW()
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
  create: (email, nom, prenom, territoire) => [
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
    [email, nom, prenom, territoire],
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
  get: (criterias) =>
    `
    SELECT
      us.id AS id,
      us.mail AS email,
      us.pwd IS NOT NULL AS hasPwd,
      us.blocked AS "isBlocked",
      us.nom AS nom,
      us.prenom AS prenom,
      us.validated AS validated,
      us.ter_code AS territoire,
      ter.parent_code AS "territoireParent",
      ur.roles
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
    WHERE 1 = 1
      ${criterias.map((c) => `AND (${c})`).join("\n      ")}
  `,
  getTotal: (criterias) => `
  SELECT 
    COUNT(*)
  FROM back.users AS us
  LEFT JOIN geo.territoires ter 
    on ter.code = us.ter_code
  WHERE 1 = 1
    ${criterias.map((c) => `AND (${c})`).join("\n    ")}
  `,
  login: `
    SELECT
      us.id as id,
      us.mail as email,
      us.pwd is not null as "hasPwd",
      us.nom as nom,
      us.prenom as prenom,
      us.blocked as "isBlocked",
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
      AND pwd = crypt($2, pwd)
      AND deleted is False
    `,
  update: (id, nom, prenom, territoire) => [
    `
      UPDATE back.users
      SET
        nom = $2,
        prenom = $3,
        ter_code = $4
      WHERE
        id = $1
      `,
    [id, nom, prenom, territoire],
  ],
};

module.exports.create = async ({ email, nom, prenom, roles, territoire }) => {
  log.i("create - IN", { email });

  // Test de l'existance d'un compte avec la même adresse mail
  const response = await pool.query(
    query.get([`us.mail ilike '%${normalize(email)}%'`]),
  );
  if (response.rows.length !== 0) {
    log.w("create - DONE - Utilisateur BO déjà existant");
    throw new AppError("Utilisateur déjà existant", {
      name: "UserAlreadyExists",
    });
  }

  // Création du compte en base de données
  const userId = await pool.query(
    ...query.create(email, nom, prenom, territoire),
  );

  const [user] = userId.rows;

  // Création des rôles en base de données
  for (const role of roles) {
    await pool.query(...query.bindRole(user.id, role));
  }

  log.i("create - DONE", { userId });

  return { code: "CreationCompte", user };
};

module.exports.update = async (id, { nom, prenom, roles, territoire }) => {
  log.i("update - IN", { id });

  if (!id) {
    throw new AppError("Paramètre manquant", {
      statusCode: 500,
    });
  }

  // Mise à jour du compte en base de données
  const { rowCount } = await pool.query(
    ...query.update(id, nom, prenom, territoire),
  );

  if (rowCount === 0) {
    log.d("update - DONE - Utilisateur BO inexistant");
    throw new AppError("Utilisateur déjà inexistant", {
      name: "UserNotFound",
    });
  }

  // Suppression des roles de l'utilisateur
  await pool.query(...query.deleteRole(id));

  // Création des rôles en base de données
  for (const role of roles) {
    await pool.query(...query.bindRole(id, role));
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
  let response = await pool.query(
    query.get([`us.mail ilike '%${normalize(email)}%'`]),
  );
  if (response.rowCount === 0) {
    throw new AppError("Utilisateur non trouvé", { name: "UserNotFound" });
  }
  let user = response.rows[0];
  log.d("activate", { user });
  if (user.validate) {
    throw new AppError("Utilisateur déjà actif", {
      name: "UserAlreadyVerified",
    });
  }
  // Activation du compte
  await pool.query(query.activate, [user.id]);

  // TODO: remove
  response = await pool.query(
    query.get([`us.mail ilike '%${normalize(email)}%'`]),
  );
  [user] = response.rows;
  log.i("active - DONE", { user });
  return user;
};

module.exports.read = async ({
  limit,
  offset,
  sortBy,
  sortDirection = "ASC",
  search,
} = {}) => {
  //  TODO : create the logic (here or in the service) to get the department of the admin.
  //  For me, the list of demandes that are goven to the admin are the list of all demands of the department

  log.i("read - IN", { search });
  const searchQuery = [];

  // Search management
  if (search?.nom && search.nom.length) {
    searchQuery.push(`us.nom ilike '%${search.nom}%'`);
  }
  if (search?.prenom && search.prenom.length) {
    searchQuery.push(`us.prenom ilike '%${search.prenom}%'`);
  }
  if (search?.email && search.email.length) {
    searchQuery.push(`us.mail ilike '%${normalize(search.email)}%'`);
  }
  if (search?.territoire && search.territoire.length) {
    searchQuery.push(`ter.label ilike '%${search.territoire}%'`);
  }

  if (search?.valide !== undefined) {
    searchQuery.push(
      `us.validated = ${search.valide === true || search.valide === "true"}`,
    );
  }

  let queryWithPagination = query.get(searchQuery);

  // Order management
  if (sortBy && sortDirection) {
    queryWithPagination += `
    ORDER BY "${sortBy}" ${sortDirection}
    `;
  } else {
    queryWithPagination += "\n ORDER BY nom, prenom";
  }

  // Pagination management
  if (limit != null && offset != null) {
    queryWithPagination += `
    OFFSET ${offset}
    LIMIT ${limit}
    `;
  }

  log.d("read", queryWithPagination);
  const response = await pool.query(queryWithPagination);

  const total = await pool.query(query.getTotal(searchQuery));

  log.i("read - DONE");
  return {
    total: total.rows[0].count,
    users: response.rows,
  };
};

module.exports.readOne = async (id) => {
  log.i("readOne - IN", { id });

  if (!id) {
    throw new AppError("Paramètre manquant", {
      statusCode: 500,
    });
  }

  const { rowCount, rows: users } = await pool.query(
    query.get([`us.id = ${id}`]),
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

module.exports.readOneByMail = async (mail) => {
  log.i("readOne - IN", { mail });

  if (!mail) {
    throw new AppError("Paramètre manquant", {
      statusCode: 500,
    });
  }

  const { rowCount, rows: users } = await pool.query(
    query.get([`us.mail = '${mail}'`]),
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
  }
  log.i("login - DONE");
  return user.rows[0];
};
