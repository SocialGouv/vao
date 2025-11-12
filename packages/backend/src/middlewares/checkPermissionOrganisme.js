const logger = require("../utils/logger");
const AppError = require("../utils/error");
const { getPool } = require("../utils/pgpool");

const log = logger(module.filename);

async function checkPermissionOrganisme(req, res, next) {
  const { id: userId } = req.decoded;
  const organismeId = req.params.organismeId;

  log.i("IN", { userId });

  const query = `
      SELECT uo.org_id
      FROM 
      front.user_organisme uo 
      JOIN front.users u ON uo.use_id = u.id
      WHERE u.id = $1
    `;
  const { rows } = await getPool().query(query, [userId]);
  if (!rows || rows.length !== 1 || rows[0].org_id.toString() !== organismeId) {
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
