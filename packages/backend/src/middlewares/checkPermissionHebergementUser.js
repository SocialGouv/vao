const logger = require("../utils/logger");
const AppError = require("../utils/error").default;
const Hebergement = require("../services/hebergement/Hebergement");

const log = logger(module.filename);

async function checkPermissionHebergementUser(req, _res, next) {
  const { id: userId } = req.decoded;
  const { id: hebergementId } = req.params;
  log.i("IN", { userId });

  if (!hebergementId) {
    return next(
      new AppError("Hebergement requis", {
        statusCode: 404,
      }),
    );
  }
  try {
    const isHebergementAutoriseForUserId =
      await Hebergement.getIsHebergementAutoriseForUserId(
        userId,
        hebergementId,
      );
    if (!isHebergementAutoriseForUserId) {
      return next(
        new AppError("Utilisateur non autorisé à modifier cet hébergement", {
          statusCode: 403,
        }),
      );
    }
    log.i("DONE");
    next();
  } catch (err) {
    log.e("checkPermissionHebergementUser error", err);
    return next(
      new AppError("Erreur interne lors de la vérification des permissions", {
        statusCode: 500,
      }),
    );
  }
}

module.exports = checkPermissionHebergementUser;
