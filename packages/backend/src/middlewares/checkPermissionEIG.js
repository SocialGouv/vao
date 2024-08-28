const logger = require("../utils/logger");
const AppError = require("../utils/error");
const pool = require("../utils/pgpool").getPool();

const log = logger(module.filename);

async function checkPermissionEIG(req, res, next) {
  const { id: userId } = req.decoded;
  const { id: eigId } = req.params;

  if (!eigId || isNaN(eigId)) {
    return next(
      new AppError("Vous n'êtes pas autorisé à accéder à cet EIG", {
        statusCode: 403,
      }),
    );
  }
  if (isNaN(eigId)) {
    return next(
      new AppError("Invalid param type", {
        statusCode: 403,
      }),
    );
  }
  log.i("IN", { eigId, userId });

  const query = `
    SELECT
        EIG.ID
    FROM
        FRONT.USER_ORGANISME UO
        INNER JOIN FRONT.EIG EIG ON EIG.USER_ID = UO.USE_ID
    WHERE
        UO.ORG_ID IN ( SELECT ORG_ID FROM FRONT.USER_ORGANISME WHERE USE_ID = $1)
        AND EIG.ID = $2
    `;

  const { rows } = await pool.query(query, [userId, eigId]);

  if (!rows || rows.length !== 1) {
    return next(
      new AppError("Vous n'êtes pas autorisé à accéder à cet EIG", {
        statusCode: 403,
      }),
    );
  }
  log.i("DONE");
  next();
}

module.exports = checkPermissionEIG;
