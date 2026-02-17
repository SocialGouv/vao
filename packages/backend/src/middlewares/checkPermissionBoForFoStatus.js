const logger = require("../utils/logger");
const AppError = require("../utils/error").default;
const { getByUserId } = require("../services/BoUser");

const log = logger(module.filename);

async function checkPermissionBOForFoStatus(req, _res, next) {
  const { id: userId } = req.decoded;
  try {
    const UserBO = await getByUserId(userId);
    if (!UserBO || UserBO.territoireParent !== "FRA") {
      return next(
        new AppError(
          "Vous n'êtes pas autorisé à modifier le status d'un compte ova",
          { statusCode: 403 },
        ),
      );
    }
    log.i("DONE");
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = checkPermissionBOForFoStatus;
