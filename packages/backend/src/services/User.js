const Sentry = require("@sentry/node");

const { sentry } = require("../config");
const logger = require("../utils/logger");
const pool = require("../utils/pgpool").getPool();
const normalize = require("../utils/normalize");

const AppError = require("../utils/error");
const { status } = require("../helpers/users");
const { addHistoric } = require("./Tracking");

const { entities, userTypes } = require("../helpers/tracking");

const log = logger(module.filename);

const query = {
  activate: `
  UPDATE front.users
  SET
    verified = NOW(),
    edited_at = NOW()
  WHERE id = $1`,
  create: `
  INSERT INTO front.users (
    mail,
    pwd,
    status_code,
    nom,
    prenom,
    telephone,
    siret
  )
  VALUES (
    $1,
    crypt($2, gen_salt('bf')),
    $3,
    $4,
    $5,
    $6,
    $7
  )
  RETURNING
    id,
    mail as email,
    pwd is not null as "hasPwd",
    nom,
    prenom,
    telephone,
    status_code as "statusCode",
    siret
  ;`,
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
  login: `
  SELECT
    us.id,
    us.mail as email,
    us.pwd is not null as "hasPwd",
    us.nom,
    us.prenom,
    us.telephone,
    us.status_code as "statusCode",
    pm.siret as "siret",
    pm.raison_sociale as "raisonSociale"
  FROM front.users us
  LEFT JOIN front.user_organisme uo ON us.id = uo.use_id
  LEFT JOIN front.organismes o ON uo.org_id = o.id
  LEFT JOIN front.personne_morale pm ON pm.organisme_id = o.id
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
  select: (criterias) => [
    `
      SELECT
        us.id as "id",
        us.mail as email,
        us.pwd is not null as "hasPwd",
        us.nom as "nom",
        us.prenom as "prenom",
        us.telephone as "telephone",
        us.created_at as "createdAt",
        us.status_code as "statusCode",
        us.siret as "userSiret",
        pm.siret as "siret",
        pm.raison_sociale as "raisonSociale",
        (
          SELECT COALESCE(jsonb_agg(r.label), '[]'::jsonb)
          FROM front.roles r
          INNER JOIN front.user_roles ur ON ur.rol_id = r.id
          WHERE ur.use_id = us.id
        ) AS "roles"
      FROM front.users us
      LEFT JOIN front.user_organisme uo ON us.id = uo.use_id
      LEFT JOIN front.organismes o ON uo.org_id = o.id
      LEFT JOIN front.personne_morale pm ON pm.organisme_id = o.id
      WHERE 1=1
      ${Object.keys(criterias)
        .map((criteria, i) => ` AND us.${criteria} = $${i + 1}`)
        .join(" ")}
      `,
    Object.values(criterias),
  ],
  updateLastConnection: `
    UPDATE front.users
      SET
      LASTCONNECTION_AT = NOW()
    WHERE
      id = $1
  `,
  updateUser: `
    WITH updated_user AS (
      UPDATE front.users
      SET
        nom = $2,
        prenom = $3,
        edited_at = NOW()
      WHERE
        id = $1
      RETURNING id
    )
    SELECT
      us.id as "id",
      us.mail as email,
      us.pwd IS NOT NULL as "hasPwd",
      us.nom as "nom",
      us.prenom as "prenom",
      us.telephone as "telephone",
      us.created_at as "createdAt",
      us.status_code as "statusCode",
      pm.siret as "siret",
      pm.raison_sociale as "raisonSociale"
    FROM front.users us
    INNER JOIN updated_user uu ON us.id = uu.id
    INNER JOIN front.user_organisme uo ON us.id = uo.use_id
    INNER JOIN front.organismes o ON uo.org_id = o.id;
    LEFT JOIN front.personne_morale pm ON pm.organisme_id = o.id
  `,
};

module.exports.registerByEmail = async ({
  email,
  password,
  nom,
  prenom,
  telephone,
  siret,
}) => {
  log.i("registerByEmail - IN", { email });
  let response = await pool.query(...query.select({ mail: normalize(email) }));
  if (response.rows.length !== 0) {
    log.i("registerByEmail - DONE - Utilisateur déjà existant");
    throw new AppError("Utilisateur déjà existant", {
      name: "UserAlreadyExists",
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
    telephone,
    siret,
  ]);
  log.i("registerByEmail - DONE", { response });
  const [user] = response.rows;
  return { code: "CreationCompte", user };
};

module.exports.editPassword = async ({ email, password }) => {
  log.i("editPassword - IN", { email });
  const response = await pool.query(
    ...query.select({ mail: normalize(email) }),
  );
  const [user] = response.rows;
  log.d("editPassword", { user });
  await pool.query(...query.editPassword(email, password));
  const responseWithUpdate = await pool.query(
    ...query.select({ mail: normalize(email) }),
  );
  const [userUpdated] = responseWithUpdate.rows;
  log.i("editPassword - DONE", { user: userUpdated });
  return userUpdated;
};

module.exports.editStatus = async (userId, statusCode) => {
  log.i("editStatus - IN", { statusCode, userId });
  await pool.query(...query.editStatus(userId, statusCode));
  log.i("editStatus - DONE");
};

module.exports.activate = async (email) => {
  log.i("active - IN", { email });
  const response = await pool.query(
    ...query.select({ mail: normalize(email) }),
  );
  if (response.rows.length === 0) {
    throw new AppError("Utilisateur non trouvé", { name: "UserNotFound" });
  }
  const user = response.rows[0];
  log.w("activate", { user });
  if (!user.sub && user.statusCode !== status.NEED_EMAIL_VALIDATION) {
    throw new AppError("Utilisateur déjà actif", {
      name: "UserAlreadyVerified",
    });
  }
  // TODO handle siret already exists new status ?
  const newStatus = user.userSiret
    ? status.NEED_SIRET_VALIDATION
    : status.VALIDATED;
  if (!user.sub) {
    await pool.query(...query.editStatus(user.id, newStatus));
  }
  await pool.query(query.activate, [user.id]);

  const responseWithUpdate = await pool.query(
    ...query.select({ mail: normalize(email) }),
  );
  const [userUpdated] = responseWithUpdate.rows;

  log.i("active - DONE", { user: userUpdated });
  return user;
};

module.exports.read = async (criterias = {}) => {
  log.i("read - IN");
  const user = await pool.query(...query.select(criterias));
  log.i("read - DONE");
  return user.rows;
};

module.exports.login = async ({ email, password }) => {
  log.i("read - IN", { email });
  const user = await pool.query(query.login, [normalize(email), password]);
  log.d(user.rows);
  if (user.rows.length === 0) {
    return null;
  }
  pool.query(query.updateLastConnection, [user.rows[0].id]);
  log.i("read - DONE", { user: user.rows[0] });
  return user.rows[0];
};

module.exports.updateUser = async ({ id, nom, prenom }) => {
  const response = await pool.query(query.updateUser, [id, nom, prenom]);
  return response.rows[0];
};

const getByUserId = async (userId) => {
  try {
    const response = await pool.query(...query.select({ id: userId }));
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

module.exports.addAsyncUserHistoric = async ({
  data: { oldData, newData },
  foUserId,
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
      entity: entities.userFront,
      entityId: userId,
      userId: foUserId,
      userType: userType ?? userTypes.front,
    });
  } catch (error) {
    log.w("addAsyncHistoric - DONE with error", error);
    if (sentry.enabled) {
      Sentry.captureException(error);
    }
  }
};
