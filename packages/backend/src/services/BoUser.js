const logger = require("../utils/logger");
const pool = require("../utils/pgpool").getPool();
const normalize = require("../utils/normalize");

const config = require("../config");

const AppError = require("../utils/error");
const { status } = require("../helpers/users");

const log = logger(module.filename);

const query = {
  activate: `UPDATE back.users 
  SET verified = NOW(),
  edited_at = NOW()
  WHERE id = $1`,
  create: `
    INSERT INTO back.users (
      mail, 
      pwd, 
      blocked, 
      nom,
      prenom,
      validated
    ) 
    VALUES (
      $1,
      crypt($2, gen_salt('bf')),
      $3,
      $4,
      $5,
      $6
    )
    RETURNING
      id as id,
      mail as email,
      pwd is not null as "hasPwd",
      nom,
      prenom,
      blocked as "isBlocked",
      validated
    ;
    `,
  editPassword: (email, password) => [
    `
      UPDATE back.users
      SET 
        pwd = crypt($2, gen_salt('bf')),
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
  login: `
    SELECT 
      id as id,
      mail as email,
      pwd is not null as "hasPwd",
      blocked as "isBlocked"
    FROM back.users
    WHERE 
      mail = $1
      AND pwd = crypt($2, pwd)
      AND deleted is False
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
  getList: (search) => `
      SELECT
        us.id as id,
        us.mail as email,
        us.pwd is not null as "hasPwd",
        us.blocked as "isBlocked",
        us.nom as "nom",
        us.prenom as "prenom",
        replace(replace(us.validated::text,'true','Oui')::text,'false','Non') as "valide",
        te.label as "territoire"
      FROM back.users AS us
      INNER JOIN back.user_territoires AS ut on ut.use_id = us.id
      INNER JOIN geo.territoires AS te on te.code = ut.ter_code
      WHERE 1 = 1
      ${search.map((s) => ` AND ${s} `).join("")}
  `,
  getListTotal: (search) => `
  SELECT COUNT(DISTINCT us.id)
    FROM back.users AS us
    INNER JOIN back.user_territoires AS ut on ut.use_id = us.id
    INNER JOIN geo.territoires AS te on te.code = ut.ter_code
    WHERE 1 = 1
       ${search.map((s) => ` AND ${s} `).join("")}
    `,
  };



module.exports.getList = async (
  adminId,
  { limit, offset, sortBy, sortDirection = "ASC", search } = {},
) => {
  //  TODO : create the logic (here or in the service) to get the department of the admin.
  //  For me, the list of demandes that are goven to the admin are the list of all demands of the department

  log.i("getList - IN", adminId);
  log.i("getList - search",search);
    const searchQuery = [];

  // Search management
  if (search?.nom && search.nom.length) {
    searchQuery.push(`nom ilike '%${search.nom}%'`);
  }
  if (search?.prenom && search.prenom.length) {
    searchQuery.push(`prenom ilike '%${search.prenom}%'`);;
  }
  if (search?.email && search.email.length) {
    searchQuery.push(`mail ilike '%${search.email}%'`);;
  }
  if (search?.territoire && search.territoire.length) {
    searchQuery.push(`te.label ilike '%${search.territoire}%'`);;
  }
  //if (search?.valide && search.valide.length) {
    searchQuery.push(`validated = ${search.valide}`);;
  //}
  let queryWithPagination = query.getList(searchQuery);

  // Order management
  if (sortBy && sortDirection) {
    queryWithPagination += `
    ORDER BY "${sortBy}" ${sortDirection} 
    `;
  } else {
    queryWithPagination += '\n ORDER BY nom, prenom';
  }

  // Pagination management
  if (limit != null && offset != null) {
    queryWithPagination += `
    OFFSET ${offset}
    LIMIT ${limit}
    `;
  }

  log.w("getList",queryWithPagination);
  const response = await pool.query(queryWithPagination);
  const total = await pool.query(query.getListTotal(searchQuery));
  
  log.w("getList",response.rows);
  log.w("getListTotal",total.rows[0].count);
  log.w("getList - DONE");
  return {
    users: response.rows,
    total: total.rows[0].count,
  };
};

module.exports.registerByEmail = async ({ email, password, nom, prenom }) => {
  log.i("registerByEmail - IN", { email });
  let response = await pool.query(...query.select({ mail: normalize(email) }));
  if (response.rows.length !== 0) {
    log.i("registerByEmail - DONE - Utilisateur BO déjà existant");
    throw new AppError("Utilisateur déjà existant", {
      name: "UserAlreadyExistsWithFC",
    });
  }
  log.d("registerByEmail", query.create, [
    normalize(email),
    password,
    status.NEED_EMAIL_VALIDATION,
  ]);
  response = await pool.query(query.create, [
    normalize(email),
    password,
    status.NEED_EMAIL_VALIDATION,
    nom,
    prenom,
  ]);
  log.i("registerByEmail - DONE", { response });
  log.i({ response });
  const [user] = response.rows;
  return { code: "CreationCompte", user };
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
  if (!user.sub && user.statusCode !== status.NEED_EMAIL_VALIDATION) {
    throw new AppError("Utilisateur déjà actif", {
      name: "UserAlreadyVerified",
    });
  }
  if (!user.sub) {
    await pool.query(...query.editStatus(user.id, status.VALIDATED));
  }
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

module.exports.login = async ({ email, password }) => {
  log.i("read - IN", { email, password });
  const user = await pool.query(query.login, [normalize(email), password]);
  log.d(user.rows);
  if (user.rows.length === 0) {
    return null;
  }
  log.i("read - DONE", { user: user.rows[0] });
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
