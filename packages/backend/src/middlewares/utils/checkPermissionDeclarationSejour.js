const logger = require("../../utils/logger");
const AppError = require("../../utils/error");
const pool = require("../../utils/pgpool").getPool();

const log = logger(module.filename);

const checkPermissionDeclarationSejourUtils = async (
  userId,
  declarationId,
  next,
) => {
  log.i("IN");

  if (!declarationId) {
    return next(
      new AppError(
        "Vous n'êtes pas autorisé à accéder à cette déclaration de séjour",
        {
          statusCode: 403,
        },
      ),
    );
  }

  const query = `
      SELECT ds.id
      FROM
      front.demande_sejour ds
      JOIN front.user_organisme uo ON uo.org_id = ds.organisme_id
      JOIN front.users u ON uo.use_id = u.id
      WHERE ds.id = $1
      AND u.id = $2
    `;
  const { rows } = await pool.query(query, [declarationId, userId]);
  if (!rows || rows.length !== 1) {
    return next(
      new AppError(
        "Vous n'êtes pas autorisé à accéder à cette déclaration de séjour",
        {
          statusCode: 403,
        },
      ),
    );
  }
  log.i("DONE");
  next();
};

//default export
module.exports.checkPermissionDeclarationSejourUtils =
  checkPermissionDeclarationSejourUtils;
