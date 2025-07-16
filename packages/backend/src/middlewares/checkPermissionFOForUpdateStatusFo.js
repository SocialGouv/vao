const logger = require("../utils/logger");
const AppError = require("../utils/error");
const {
  getIsUserSameOrganismeOtherUser,
  readOne,
} = require("../services/FoUser");

const { status } = require("../helpers/users");
const getByOrganisme = require("../controllers/fo-user/getByOrganisme");

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
    // Cas d'un utilisateur qui est l'organisme principal
    const isAllowedOrganismeUser = await getIsUserSameOrganismeOtherUser(
      userId,
      userIdUpdated,
    );
    if (!isAllowedOrganismeUser) {
      // Cas d'un utilisateur qui est l'organisme secondaire
      const [idOrganismeConnected, idOrganismeUpdated] = await Promise.all([
        getByOrganisme(userId),
        getByOrganisme(userIdUpdated),
      ]);
      if (!idOrganismeConnected || !idOrganismeUpdated || idOrganismeUpdated !== idOrganismeConnected) {
        return next(
          new AppError(
            "Vous n'êtes pas autorisé à modifier le status de cet utilisateur",
            { statusCode: 403 },
          ),
        );
      }
    }
    const user = await readOne(userId);
    // On vérifie que l'utilisateur qui valide est bien un utilisateur lui même validé.
    if (user.statut !== status.VALIDATED) {
      return next(
        new AppError(
          "Vous n'êtes pas autorisé à accéder à l'utilisateur de cet organisme",
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
