const logger = require("../../utils/logger");
const AppError = require("../../utils/error").default;
const Hebergement = require("../../services/hebergement/Hebergement");
const HebergementHelper = require("../../helpers/hebergement");

const log = logger(module.filename);

module.exports = async function desactivate(req, res, next) {
  const hebergementId = req.params.id;
  const { decoded } = req;
  const userId = decoded.id;

  if (!hebergementId) {
    log.w("missing or invalid parameter");

    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }
  // On recharge l'hébergement tel qu'il était avant désactivation pour pouvoir historiser et désactiver
  const hebergement = await Hebergement.getById(hebergementId);
  if (!hebergement) {
    log.w("DONE with error");
    return next(
      new AppError("Hébergement non trouvée", {
        statusCode: 404,
      }),
    );
  }
  try {
    await Hebergement.update(
      userId,
      hebergementId,
      hebergement,
      HebergementHelper.statuts.DESACTIVE,
    );

    log.i("DONE");
    return res.sendStatus(200);
  } catch (error) {
    if (error.cause === "archive") {
      return next(new AppError(error));
    }
    log.w("DONE with error");
    return next(error);
  }
};
