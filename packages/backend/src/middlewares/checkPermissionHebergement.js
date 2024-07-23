const logger = require("../utils/logger");
const AppError = require("../utils/error");
const pool = require("../utils/pgpool").getPool();

const log = logger(module.filename);

async function checkPermissionHebergement(req, res, next) {
  const { id: userId } = req.decoded;
  const { id: hebergementId } = req.params;
  log.i("IN");

  if (!hebergementId) {
    return next(
      new AppError("Vous n'êtes pas autorisé à accéder à cet hébergement", {
        statusCode: 403,
      }),
    );
  }

  const query = `
      SELECT h.id 
      FROM 
      front.hebergement h
      JOIN front.user_organisme uo ON uo.org_id = h.organisme_id
      WHERE h.id = $1
      AND uo.use_id = $2
    `;
  const { rows } = await pool.query(query, [hebergementId, userId]);
  if (!rows || rows.length !== 1) {
    return next(
      new AppError("Vous n'êtes pas autorisé à accéder à cet hébergement", {
        statusCode: 403,
      }),
    );
  }
  log.i("DONE");
  next();
}

module.exports = checkPermissionHebergement;
