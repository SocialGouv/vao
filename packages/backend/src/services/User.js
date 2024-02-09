const logger = require("../utils/logger");
const pool = require("../utils/pgpool").getPool();
const normalize = require("../utils/normalize");

const config = require("../config");

const AppError = require("../utils/error");
const { status } = require("../helpers/users");

const log = logger(module.filename);

const query = {
  create: `
    INSERT INTO front.users (
      mail, 
      pwd, 
      status_code, 
      nom,
      prenom
    ) 
    VALUES (
      $1,
      crypt($2, gen_salt('bf')),
      $3,
      $4,
      $5
    )
    RETURNING
      id as id,
      mail as email,
      pwd is not null as "hasPwd",
      nom,
      prenom,
      status_code as "statusCode"
    ;
    `,
  login: `
    SELECT 
      id as id,
      mail as email,
      pwd is not null as "hasPwd",
      status_code as "statusCode"
    FROM front.users
    WHERE 
      mail = $1
      AND pwd = crypt($2, pwd)
      AND deleted is False
    `,
  editPassword: (email, password) => [
    `
      UPDATE front.users
      SET 
        pwd = crypt($2, gen_salt('bf')),
        edited_at = NOW()
      WHERE 
        mail = $1
      `,
    [normalize(email), password],
  ],
  editStatus: (userId, statusCode) => [
    `
      UPDATE front.users
      SET 
        status_code = $2,
        edited_at = NOW()
      WHERE 
        id = $1
      `,
    [userId, statusCode],
  ],
  select: (criterias) => [
    `
      SELECT 
        id as id,
        mail as email,
        pwd is not null as "hasPwd",
        status_code as "statusCode"
      FROM front.users
      WHERE 1=1 
      ${Object.keys(criterias)
        .map((criteria, i) => ` AND ${criteria} = $${i + 1}`)
        .join(" ")}
      `,
    Object.values(criterias),
  ],
  activate: `UPDATE front.users 
  SET verified = NOW(),
  edited_at = NOW()
  WHERE id = $1`,
};

module.exports.registerByEmail = async ({ email, password, nom, prenom }) => {
  log.i("registerByEmail - IN", { email });
  let response = await pool.query(...query.select({ mail: normalize(email) }));
  if (response.rows.length !== 0) {
    log.i("registerByEmail - DONE - Utilisateur déjà existant");
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
  const [user] = response.rows;
  return { user, code: "CreationCompte" };
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

module.exports.editStatus = async (userId, statusCode) => {
  log.i("editStatus - IN", { userId, statusCode });
  await pool.query(...query.editStatus(userId, statusCode));
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
