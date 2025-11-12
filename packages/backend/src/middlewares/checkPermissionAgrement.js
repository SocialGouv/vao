const logger = require("../utils/logger");
const AppError = require("../utils/error");
const { getPool } = require("../utils/pgpool");

const log = logger(module.filename);

async function checkPermissionAgrement(req, res, next) {
  const { id: userId } = req.decoded;
  // Récupère l'Id de l'organisme en fonction de la provenance (POST ou GET)
  const organismeId = req.body?.organismeId ?? req.params?.id ?? null;
  log.i("IN");

  const query = `
      SELECT uo.org_id
      FROM front.user_organisme uo 
      JOIN front.users u ON uo.use_id = u.id
      WHERE u.id = $1
    `;
  const { rows } = await getPool().query(query, [userId]);
  if (
    !rows ||
    rows.length !== 1 ||
    rows[0].org_id.toString() !== organismeId.toString()
  ) {
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
