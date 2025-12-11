const logger = require("../utils/logger");
const AppError = require("../utils/error").default;
const { getPool } = require("../utils/pgpool");

const log = logger(module.filename);

async function checkPermissionDeclarationSejour(req, res, next) {
  const { declarationId } = req.params;
  const { departements } = req;
  log.i("IN");

  if (!declarationId || isNaN(declarationId) || !departements) {
    return next(
      new AppError(
        "Vous n'êtes pas autorisé à modifier à cette déclaration de séjour",
        {
          statusCode: 403,
        },
      ),
    );
  }

  const query = `
      SELECT 
         ds.id
      FROM 
      front.demande_sejour ds
      WHERE ds.id = $1
      AND ds.departement_suivi = ANY($2)
    `;
  const { rows } = await getPool().query(query, [
    declarationId,
    departements.map((d) => d.value),
  ]);
  if (!rows || rows.length !== 1) {
    return next(
      new AppError(
        "Vous n'êtes pas autorisé à modifier à cette déclaration de séjour",
        {
          statusCode: 403,
        },
      ),
    );
  }
  log.i("DONE");
  next();
}

module.exports = checkPermissionDeclarationSejour;
