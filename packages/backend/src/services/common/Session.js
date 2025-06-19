const pool = require("../../utils/pgpool").getPool();
const logger = require("../../utils/logger");
const AppError = require("../../utils/error");

const log = logger(module.filename);

const query = {
  create: (targetSchema, id, token) => [
    `INSERT INTO ${targetSchema}.sessions (cle, refresh_token, created_at) 
    VALUES (
      $1,
      $2,
      NOW()
    )
    RETURNING
      id as id,
      cle as "userId",
      refresh_token as "refreshToken",
      created_at as "created"
    ;`,
    [id, token],
  ],
  delete: (targetSchema, criterias) => [
    `
      DELETE FROM ${targetSchema}.sessions
      WHERE 1=1 
      ${Object.keys(criterias)
        .map((criteria, i) => ` AND ${criteria} = $${i + 1}`)
        .join(" ")}
      `,
    Object.values(criterias),
  ],
  select: (targetSchema, criterias) => [
    `
      SELECT 
      id as id,
      cle as "userId",
      refresh_token  as "refreshToken",
      created_at as "created"
      FROM ${targetSchema}.sessions
      WHERE 1=1 
      ${Object.keys(criterias)
        .map((criteria, i) => ` AND ${criteria} = $${i + 1}`)
        .join(" ")}
      `,
    Object.values(criterias),
  ],
};

module.exports.read = async (targetSchema, criterias = {}) => {
  log.i("read - IN");
  const { rows } = await pool.query(...query.select(targetSchema, criterias));
  return rows;
};

module.exports.rotate = async (
  id,
  oldToken,
  token,
  targetSchema,
  errorObject = null,
) => {
  log.i("rotate - IN");
  const sessionDeleted = await pool.query(
    ...query.delete(targetSchema, { refresh_token: oldToken }),
  );
  if (sessionDeleted.rowCount === 0) {
    log.w("error while deleting old session");
    log.w(errorObject);

    throw new AppError("erreur sur la suppression de session");
  }
  const session = await pool.query(...query.create(targetSchema, id, token));
  if (!session || session.rows.length !== 1) {
    log.w("error during session creation");
    throw new AppError("erreur sur la création de session");
  }
  log.i("rotate - DONE");
  return session.rows[0];
};

module.exports.clean = async ({ id }, targetSchema) => {
  log.i("clean - IN");
  const sessionDeleted = await pool.query(
    ...query.delete(targetSchema, { cle: id }),
  );
  if (!sessionDeleted)
    throw new AppError("erreur sur la suppression de session");
  log.i("clean - DONE");
  return sessionDeleted;
};

module.exports.create = async (id, token, targetSchema) => {
  log.w("create - IN");
  const session = await pool.query(...query.create(targetSchema, id, token));
  if (!session) throw new AppError("erreur sur la création de session");
  log.i("create - DONE");
  return session.rows[0];
};
