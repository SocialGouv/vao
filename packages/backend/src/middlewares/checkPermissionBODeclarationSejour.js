const logger = require("../utils/logger");
const AppError = require("../utils/error");
const pool = require("../utils/pgpool").getPool();

const log = logger(module.filename);

export default function (req, res, next) {
  try {
    checkPermissionDeclarationSejour(req, res)
    next()
  } catch (error) {
    log.w(error)
    next(error) 
  }
}

export default async function checkPermissionDeclarationSejour(req, _res) {
  const { declarationId } = req.params;
  const { departements } = req;
  const { territoireCode } = req.decoded;
  log.i("IN");

  if (!declarationId || !departements) { 
    throwHttpForbiddenError(
       "Vous n'êtes pas autorisé à accéder à cette déclaration de séjour",
    );
  }

  const sejour = getSejour(declarationId)
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
    return;
  }

  if (checkOrganismeAndAgrement({personne_morale, region_obtention, territoireCode})) {
    return 
  }

  throwHttpForbiddenError("Vous n'êtes pas autorisé à accéder à cette déclaration de séjour")
}

async function getSejour(declarationId) {
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
      throwHttpForbiddenError("Vous n'êtes pas autorisé à accéder à cette déclaration de séjour")
    }
    // Récupération des données brutes
    return rows[0];
  } catch (err) {
    throwHttpForbiddenError("La recheche du séjour et de l'organisateur ont échoué")
  }
}

async function checkOrganismeAndAgrement({personne_morale, region_obtention, territoireCode}) {
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
        return true;
      }
    } else {
      //  Vérification sur la région d'obtention (Organisme porteur de l'agrément)
      if (region_obtention === territoireCode) {
        return true;
      }
    }
  } catch (err) {
    throwHttpInternalError(
        "La recheche de l'agrément de l'organisateur principal a échoué",
        err
    );
  }

  return false
}

async function throwHttpForbiddenError(message) {
  throw new AppError(
    message,
    {
      statusCode: 403,
    },
  );
}

async function throwHttpInternalError(message, err) {
  throw new AppError(
    message,
    {
      statusCode: 500,
      cause: err
    },
  ); 
}