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

  // Requête SQL simplifiée, ne récupérant que les informations brutes nécessaires
  const query = `
    SELECT ds.id, ds.hebergement, o.personne_morale, agr.region_obtention
    FROM front.demande_sejour ds
    INNER JOIN front.organismes o ON o.id = ds.organisme_id
    LEFT JOIN front.agrements agr ON agr.organisme_id = ds.organisme_id
    WHERE ds.id = $1
  `;

  let sejour;
  try {
    const { rows } = await pool.query(query, [declarationId]);
    if (!rows || rows.length === 0) {
      return next(
        new AppError(
          "Vous n'êtes pas autorisé à accéder à cette déclaration de séjour",
          {
            statusCode: 403,
          },
        ),
      );
    }
    // Récupération des données brutes
    sejour = rows[0];
  } catch (err) {
    log.w(err);
    return next(
      new AppError("La recheche du séjour et de l'organisateur ont échoué", {
        cause: err,
      }),
    );
  }

  const { hebergement, personne_morale, region_obtention } = sejour;

  // Traitement des données JSON pour vérifier les départements
  const hebergements = hebergement?.hebergements || [];
  const departementsHebergements = hebergements.map(
    (h) => h.coordonnees?.adresse?.departement,
  );

  const hasValidDepartement = departements.some((dep) =>
    departementsHebergements.includes(dep.value),
  );

  if (hasValidDepartement) {
    return next();
  }

  try {
    // Vérification supplémentaire sur les organismes et leur agrément
    if (!personne_morale?.porteurAgrement) {
      // Si l'agrément n'est pas "porteur", il faut vérifier les organismes liés
      const queryOrganismeAgre = `
        SELECT agr.region_obtention
        FROM front.organismes o
        INNER JOIN front.agrements agr ON agr.organisme_id = o.id
        WHERE o.personne_morale->>'siret' = $1
      `;
      const { rows: agrements } = await pool.query(queryOrganismeAgre, [
        personne_morale.etablissementPrincipal?.siret,
      ]);

      const hasAgrement = agrements.some(
        (agr) => agr.region_obtention === territoireCode,
      );
      if (hasAgrement) {
        return next();
      }
    } else {
      //  Vérification sur la région d'obtention (Organisme porteur de l'agrément)
      if (region_obtention === territoireCode) {
        return next();
      }
    }
  } catch (err) {
    log.w(err);
    return next(
      new AppError(
        "La recheche de l'agrément de l'organisateur principal a échoué",
        {
          cause: err,
        },
      ),
    );
  }

  // Si aucune des conditions n'est remplie, accès refusé
  return next(
    new AppError(
      "Vous n'êtes pas autorisé à accéder à cette déclaration de séjour",
      {
        statusCode: 403,
      },
    ),
  );
}

module.exports = checkPermissionDeclarationSejour;
