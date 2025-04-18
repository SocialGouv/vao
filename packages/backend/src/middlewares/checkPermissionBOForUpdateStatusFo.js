const logger = require("../utils/logger");
const AppError = require("../utils/error");
const { getByUserId } = require("../services/BoUser");

const { status } = require("../helpers/users");

const log = logger(module.filename);

const AutorisedStatusChange = [status.BLOCKED, status.VALIDATED];

async function checkPermissionBOForUpdateStatusFo(req, _res, next) {
  const { id: userId } = req.decoded;
  const { status: newStatus } = req.query;
  if (!AutorisedStatusChange.includes(newStatus)) {
    return next(
      new AppError("Vous n'êtes pas autorisé à modifier ce status", {
        statusCode: 403,
      }),
    );
  }
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

module.exports = checkPermissionBOForUpdateStatusFo;
