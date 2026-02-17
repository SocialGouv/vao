const logger = require("../utils/logger");
const AppError = require("../utils/error").default;
const { getPool } = require("../utils/pgpool");

const log = logger(module.filename);

async function checkPermissionBOAgrement(req, res, next) {
  const { id: userId } = req.decoded;
  log.i("IN");
  const query = `
      SELECT u.id
      FROM back.users u 
      INNER JOIN geo.territoires t ON t.code = u.ter_code
      WHERE u.id = $1 and t.parent_code = 'FRA'
    `;
  const { rows } = await getPool().query(query, [userId]);
  if (!rows || rows.length !== 1) {
    log.w("Utilisateur non autorisé à modifier l'agrement");
    return next(
      new AppError("Vous n'êtes pas autorisé à modifier cet agrément", {
        statusCode: 403,
      }),
    );
  }
  log.i("DONE");
  next();
}

module.exports = checkPermissionBOAgrement;
