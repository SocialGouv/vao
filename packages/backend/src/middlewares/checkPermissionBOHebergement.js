const logger = require("../utils/logger");
const AppError = require("../utils/error");
const Hebergement = require("../services/hebergement/Hebergement");

const log = logger(module.filename);

async function checkPermissionHebergement(req, res, next) {
  const { id: hebergementId } = req.params;

  if (!hebergementId) {
    return next(
      new AppError("Paramètres invalides", {
        statusCode: 400,
      }),
    );
  }

  let statut;

  try {
    statut = await Hebergement.getStatut(hebergementId);
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }

  if (statut !== "actif") {
    return next(
      new AppError("Vous n'êtes pas autorisé à accéder à cet hébergement", {
        statusCode: 403,
      }),
    );
  }

  next();
}

module.exports = checkPermissionHebergement;
