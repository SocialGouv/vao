const logger = require("../utils/logger");
const AppError = require("../utils/error");
const pool = require("../utils/pgpool").getPool();

const log = logger(module.filename);

async function checkPermissionOrganisme(req, res, next) {
  const { id: userId } = req.decoded;

  log.i("IN", { userId });

  const query = `
      SELECT uo.org_id
      FROM 
      front.user_organisme uo 
      JOIN front.users u ON uo.use_id = u.id
      WHERE u.id = $1
    `;
  const { rows } = await pool.query(query, [userId]);
  if (!rows || rows.length !== 1) {
    return next(
      new AppError("Utilisateur non autorisé à accéder à l'organisme", {
        statusCode: 403,
      }),
    );
  }
  log.i("DONE");
  next();
}

module.exports = checkPermissionOrganisme;
