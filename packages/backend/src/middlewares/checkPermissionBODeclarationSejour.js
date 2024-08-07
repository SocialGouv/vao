const logger = require("../utils/logger");
const AppError = require("../utils/error");
const pool = require("../utils/pgpool").getPool();

const log = logger(module.filename);

async function checkPermissionDeclarationSejour(req, res, next) {
  const { declarationId } = req.params;
  const { departements } = req;
  const { territoireCode } = req.decoded;
  log.i("IN");

  if (!declarationId || !departements) {
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
      SELECT
         ds.id
      FROM front.demande_sejour ds
      JOIN front.agrements a ON a.organisme_id = ds.organisme_id
      WHERE ds.id = $1
      AND (
        a.region_obtention = $2
        OR jsonb_path_query_array(hebergement, '$.hebergements[*].coordonnees.adresse.departement') ?| ($3)::text[]
      )
    `;
  const { rows } = await pool.query(query, [
    declarationId,
    territoireCode,
    departements.map((d) => d.value),
  ]);

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
}

module.exports = checkPermissionDeclarationSejour;
