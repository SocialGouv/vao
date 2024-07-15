const logger = require("../utils/logger");
const AppError = require("../utils/error");
const pool = require("../utils/pgpool").getPool();

const log = logger(module.filename);

async function checkPermissionAgrement(req, res, next) {
  const { id: userId } = req.decoded;
  const { organismeId } = req.body;

  log.i("IN");

  const query = `
      SELECT uo.org_id
      FROM front.user_organisme uo 
      JOIN front.users u ON uo.use_id = u.id
      WHERE u.id = $1
    `;
  const { rows } = await pool.query(query, [userId]);
  if (!rows || rows.length !== 1 || rows[0].org_id.toString() !== organismeId) {
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

module.exports = checkPermissionAgrement;
