const logger = require("../utils/logger");
const AppError = require("../utils/error");
const {
  getIsUserSameOrganismeOtherUser,
  readOne,
} = require("../services/FoUser");

const { status } = require("../helpers/users");

const log = logger(module.filename);

const AutorisedStatusChange = [status.BLOCKED, status.VALIDATED];

async function checkPermissionFOForUpdateStatusFo(req, _res, next) {
  const { id: userId } = req.decoded;
  const { status: newStatus } = req.query;
  const { userId: userIdUpdated } = req.params;

  if (!newStatus) {
    log.w("missing parameter status");
    return next(new AppError("Paramètre manquant status", { statusCode: 400 }));
  }

  if (!AutorisedStatusChange.includes(newStatus)) {
    return next(
      new AppError("Vous n'êtes pas autorisé à modifier ce status", {
        statusCode: 403,
      }),
    );
  }
  try {
    const isAllowedOrganismeUser = await getIsUserSameOrganismeOtherUser(
      userId,
      userIdUpdated,
    );
    const user = await readOne(userId);
    // On vérifie que l'utilisateur qui valide est bien un utilisateur lui même validé.
    if (!isAllowedOrganismeUser && user.status !== status.VALIDATED) {
      return next(
        new AppError(
          "Vous n'êtes pas autorisé accéder à l'utilisateur de cet organisme",
          { statusCode: 403 },
        ),
      );
    }

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = checkPermissionFOForUpdateStatusFo;
