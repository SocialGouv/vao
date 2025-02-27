const logger = require("../utils/logger");
const AppError = require("../utils/error");
const Organisme = require("../services/Organisme");

const log = logger(module.filename);

async function checkPermissionHebergementSiegeSocial(req, _res, next) {
  const { id: userId } = req.decoded;
  log.i("IN", { userId });
  const isSiegeSocial = await Organisme.getIsUserIdSiegeSocial(userId);
  if (!isSiegeSocial) {
    return next(
      new AppError("Utilisateur non autorisé à modifier cet hébergement", {
        statusCode: 403,
      }),
    );
  }
  log.i("DONE");
  next();
}

module.exports = checkPermissionHebergementSiegeSocial;
