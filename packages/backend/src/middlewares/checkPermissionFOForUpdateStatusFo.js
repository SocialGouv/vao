const AppError = require("../utils/error");
const { getIsUserSameOrganismeOtherUser } = require("../services/FoUser");
const { status } = require("../helpers/users");

const AutorisedStatusChange = [status.BLOCKED, status.VALIDATED];

async function checkPermissionFOForUpdateStatusFo(req, _res, next) {
  const { id: userId } = req.decoded;
  const { status: newStatus } = req.query;
  const { userId: userIdUpdated } = req.params;
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

    if (!isAllowedOrganismeUser) {
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
