const logger = require("../utils/logger");
const pool = require("../utils/pgpool").getPool();
const normalize = require("../utils/normalize");

const config = require("../config");

const AppError = require("../utils/error");

const log = logger(module.filename);

const query = {
  activate: `UPDATE back.users
  SET validated = true,
  edited_at = NOW()
  WHERE id = $1`,

  bindRole: (user, role) => [
    `INSERT INTO back.user_roles (
      use_id,
      rol_id
    ) SELECT $1, id FROM back.roles WHERE label = $2
    ;`,
    [user, role],
  ],
  deleteRole: (id) => [
    `DELETE FROM back.user_roles  WHERE use_id = $1;`,
    [id],
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
  getList: (search) => `
      SELECT
        us.id as id,
        us.mail as email,
        us.pwd is not null as "hasPwd",
        us.blocked as "isBlocked",
        us.nom as "nom",
        us.prenom as "prenom",
        us.validated as "validated",
        t.label as "territoire"
      FROM back.users AS us
      LEFT JOIN geo.territoires t on t.code = us.ter_code
      WHERE 1 = 1
      ${search.map((s) => ` AND ${s} `).join("")}
  `,
  getListTotal: (search) => `
  SELECT COUNT(DISTINCT us.id)
    FROM back.users AS us
    LEFT JOIN geo.territoires t on t.code = us.ter_code
    WHERE 1 = 1
       ${search.map((s) => ` AND ${s} `).join("")}
    `,
  login: `
    SELECT
      id as id,
      mail as email,
      pwd is not null as "hasPwd",
      nom as nom,
      prenom as prenom,
      blocked as "isBlocked",
      ter_code as "territoireCode"
    FROM back.users
    WHERE
      mail = $1
      AND pwd = crypt($2, pwd)
      AND deleted is False
    `,
  selectUser: (search) => `
   SELECT 
      us.id AS id,
      us.mail AS email,
      us.pwd IS NOT NULL AS hasPwd,
      us.blocked AS isBlocked,
      us.nom AS nom,
      us.prenom AS prenom,
      us.validated AS validated,
      us.ter_code AS territoire,
      ter.parent_code AS territoireParent,
      jsonb_agg(
          jsonb_build_object(
              'roleid', ro.id,
              'role', ro.label
          )
      ) AS roles
    FROM 
      back.users AS us
      INNER JOIN back.user_roles ur ON ur.use_id = us.id
      INNER JOIN back.roles ro ON ur.rol_id = ro.id
      INNER JOIN geo.territoires ter on ter.code = us.ter_code
      WHERE 1 = 1
      ${search.map((s) => ` AND ${s} `).join("")}
    GROUP BY 
      us.id, us.mail, us.pwd, us.blocked, us.nom, us.prenom, us.validated, us.ter_code, ter.parent_code ;
  `,
  select: (criterias) => [
    `
      SELECT
        id as id,
        mail as email,
        pwd is not null as "hasPwd",
        blocked as "isBlocked",
        nom as "nom",
        prenom as "prenom",
        validated as "valide"
      FROM back.users
      WHERE 1=1
      ${Object.keys(criterias)
        .map((criteria, i) => ` AND ${criteria} = $${i + 1}`)
        .join(" ")}
      `,
    Object.values(criterias),
  ],
  updateUser: (id, nom, prenom, territoire) => [
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

module.exports.getList = async ({
  limit,
  offset,
  sortBy,
  sortDirection = "ASC",
  search,
} = {}) => {
  //  TODO : create the logic (here or in the service) to get the department of the admin.
  //  For me, the list of demandes that are goven to the admin are the list of all demands of the department

  log.i("getList - IN");
  log.d("getList - search", search);
  const searchQuery = [];

  // Search management
  if (search?.nom && search.nom.length) {
    searchQuery.push(`nom ilike '%${search.nom}%'`);
  }
  if (search?.prenom && search.prenom.length) {
    searchQuery.push(`prenom ilike '%${search.prenom}%'`);
  }
  if (search?.email && search.email.length) {
    searchQuery.push(`mail ilike '%${search.email}%'`);
  }
  if (search?.territoire && search.territoire.length) {
    searchQuery.push(`t.label ilike '%${search.territoire}%'`);
  }
  //if (search?.valide && search.valide.length) {
  searchQuery.push(`validated = ${search.valide}`);
  //}
  let queryWithPagination = query.getList(searchQuery);

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

  log.d("getList", queryWithPagination);
  const response = await pool.query(queryWithPagination);
  const total = await pool.query(query.getListTotal(searchQuery));

  log.i("getList - DONE");
  return {
    total: total.rows[0].count,
    users: response.rows,
  };
};

module.exports.registerByEmail = async ({
  email,
  nom,
  prenom,
  roles,
  territoire,
}) => {
  log.i("registerByEmail - IN", { email });

  // Test de l'existance d'un compte avec la même adresse mail
  const response = await pool.query(
    ...query.select({ mail: normalize(email) }),
  );
  log.i("response query.select({ mail:", response);
  if (response.rows.length !== 0) {
    log.i("registerByEmail - DONE - Utilisateur BO déjà existant");
    throw new AppError("Utilisateur déjà existant", {
      name: "UserAlreadyExistsWithFC",
    });
  }

  // Création du compte en base de données
  const userId = await pool.query(
    ...query.create(email, nom, prenom, territoire),
  );

  log.i({ userId });
  const [user] = userId.rows;

  // Création des rôles en base de données
  roles.forEach((element) => {
    log.d("element : ", element);
    pool.query(...query.bindRole(user.id, element));
  });

  log.i("registerByEmail - DONE", { userId });

  return { code: "CreationCompte", user };
};

  module.exports.updateUser = async ({
    id,
    nom,
    prenom,
    roles,
    territoire
  }) => {
  log.i("updateUser - IN", { id });

  // Test de l'existance d'un compte avec cet identifiant
  const response = await pool.query(
    ...query.select({ id: id }),
  );
  log.d("response query.select({ id:", response);
  if (response.rows.length === 0) {
    log.d("updateUser - DONE - Utilisateur BO inexistant");
    throw new AppError("Utilisateur déjà inexistant", {
      name: "UserNotExist",
    });
  }
  
  // Mise à jour du compte en base de données
  const userId = await pool.query(
    ...query.updateUser(id, nom, prenom, territoire),
  );

  const [user] = userId.rows;

  // Suppression des roles de l'utilisateur
  await pool.query(
    ...query.deleteRole(id),
  );


  // Création des rôles en base de données
  roles.forEach((element) => {
    log.d("element : ", element);
    pool.query(...query.bindRole(id, element));
  });

  log.i("updateUser - DONE", { userId });

  return { code: "MajCompte", user };
};


module.exports.editPassword = async ({ email, password }) => {
  log.i("editPassword - IN", { email });
  let response = await pool.query(...query.select({ mail: normalize(email) }));
  let [user] = response.rows;
  log.d("editPassword", { user });
  await pool.query(...query.editPassword(email, password));
  response = await pool.query(...query.select({ mail: normalize(email) }));
  [user] = response.rows;
  log.i("editPassword - DONE", { user });
  return user;
};

module.exports.editStatus = async (userId, isBlocked) => {
  log.i("editStatus - IN", { isBlocked, userId });
  await pool.query(...query.editStatus(userId, isBlocked));
  log.i("editStatus - DONE");
};

module.exports.activate = async (email) => {
  log.i("active - IN", { email });
  let response = await pool.query(...query.select({ mail: normalize(email) }));
  if (response.rows.length === 0) {
    throw new AppError("Utilisateur non trouvé", { name: "UserNotFound" });
  }
  let user = response.rows[0];
  log.d("activate", { user });
  if (user.valide) {
    throw new AppError("Utilisateur déjà actif", {
      name: "UserAlreadyVerified",
    });
  }
  // Activation du compte
  await pool.query(query.activate, [user.id]);

  response = await pool.query(...query.select({ mail: normalize(email) }));
  [user] = response.rows;
  log.i("active - DONE", { user });
  return user;
};

module.exports.read = async (criterias = {}) => {
  log.i("read - IN");
  
  const user = await pool.query(...query.select(criterias));
  log.i("read - DONE");
  return user.rows;
};


module.exports.readUser = async ({
  search,
} = {}) => {
  log.i("read - IN");
  log.d("read - search", search);
  const searchQuery = [];
  if (search?.id && search.id.length) {
    searchQuery.push(`us.id = '${search.id}'`);
  }
  if (search?.email && search.email.length) {
    searchQuery.push(`us.mail = '${search.email}'`);
  }

  let querySelect = query.selectUser(searchQuery);

  log.d("getList", querySelect);
  const response = await pool.query(querySelect);

  log.i("getList - DONE");
  return {
    user: response.rows,
  };
};

module.exports.login = async ({ email, password }) => {
  log.i("login - IN", { email, password });
  const user = await pool.query(query.login, [normalize(email), password]);
  log.d(user.rows);
  if (user.rows.length === 0) {
    return null;
  }
  log.i("login - DONE");
  return user.rows[0];
};

module.exports.getProfile = async (userId) => {
  log.i("read - IN", { userId });
  const profiles = await pool.query(query.getProfile, [
    userId,
    config.postgres.secretKey,
  ]);
  if (profiles.rows.length === 0) {
    return null;
  }
  log.i("read - DONE", { profile: profiles.rows[0] });
  return profiles.rows[0];
};
