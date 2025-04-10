const logger = require("../utils/logger");
const AppError = require("../utils/error");

const log = logger(module.filename);

const { getIsUserSameOrganismeOtherUser } = require("../services/FoUser");

async function checkPermissionReadFo(req, res, next) {
  try {
    const { id: userId } = req.decoded;
    const { userId: userIdUpdated } = req.params;
    if (!userIdUpdated) {
      return next(
        new AppError("Vous n'êtes pas autorisé à modifier les roles", {
          statusCode: 403,
        }),
      );
    }
    const isAllowedOrganismeUser = await getIsUserSameOrganismeOtherUser(
      userId,
      userIdUpdated,
    );
    if (!isAllowedOrganismeUser) {
      throw new AppError(
        "Vous n'êtes pas autorisé accéder à l'utilisateur de cet organisme",
        { statusCode: 403 },
      );
    }
    log.i("DONE");
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = checkPermissionReadFo;
