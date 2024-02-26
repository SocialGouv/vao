const pool = require("../utils/pgpool").getPool();
const logger = require("../utils/logger");

const AppError = require("../utils/error");

const log = logger(module.filename);

const query = {
  create: (id, token) => [
    `INSERT INTO back.sessions (cle, refresh_token, created_at) 
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
  delete: (criterias) => [
    `
      DELETE FROM back.sessions
      WHERE 1=1 
      ${Object.keys(criterias)
        .map((criteria, i) => ` AND ${criteria} = $${i + 1}`)
        .join(" ")}
      `,
    Object.values(criterias),
  ],
  select: (criterias) => [
    `
      SELECT 
      id as id,
      cle as "userId",
      refresh_token  as "refreshToken",
      created_at as "created"
      FROM back.sessions
      WHERE 1=1 
      ${Object.keys(criterias)
        .map((criteria, i) => ` AND ${criteria} = $${i + 1}`)
        .join(" ")}
      `,
    Object.values(criterias),
  ],
};

module.exports.read = async (criterias = {}) => {
  log.i("read - IN");
  const user = await pool.query(...query.select(criterias));
  if (!user && user.rows) {
    log.w("error while reading session");
    throw new Error("erreur sur la lecture de session");
  }
  return user.rows;
};

module.exports.rotate = async (id, oldToken, token, errorObject = null) => {
  log.i("rotate - IN");
  const sessionDeleted = await pool.query(
    ...query.delete({ refresh_token: oldToken }),
  );
  if (sessionDeleted.rowCount === 0) {
    log.w("error while deleting old session");
    log.w(errorObject);

    // await this.clean(id);
    throw new AppError("erreur sur la suppression de session");
  }
  const session = await pool.query(...query.create(id, token));
  if (!session || session.rows.length !== 1) {
    log.w("error during session creation");
    throw new AppError("erreur sur la création de session");
  }
  log.i("rotate - DONE");
  return session.rows[0];
};

module.exports.clean = async (id) => {
  log.i("clean - IN");
  const sessionDeleted = await pool.query(...query.delete({ cle: id }));
  if (!sessionDeleted)
    throw new AppError("erreur sur la suppression de session");
  log.i("clean - DONE");
  return sessionDeleted;
};

module.exports.create = async (id, token) => {
  log.i("create - IN");
  const session = await pool.query(...query.create(id, token));
  if (!session) throw new AppError("erreur sur la création de session");
  log.i("create - DONE");
  return session.rows[0];
};
