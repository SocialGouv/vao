const logger = require("../utils/logger");
const AppError = require("../utils/error").default;
const { roles } = require("../helpers/users");

const log = logger(module.filename);

const {
  readOne,
  getIsUserSameOrganismeOtherUser,
} = require("../services/FoUser");

function checkPermissionFoRole({ role }) {
  return async (req, _res, next) => {
    const { id: userId } = req.decoded;
    const { userId: userIdUpdated } = req.params;
    if (!userIdUpdated) {
      return next(
        new AppError("Vous n'êtes pas autorisé à modifier les roles", {
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
      if (role === roles.EIG_ECRITURE) {
        const user = await readOne(userId);
        const isUserDroitEcriture = user.roles.some(
          (d) => d === roles.EIG_ECRITURE,
        );
        if (!isUserDroitEcriture) {
          return next(
            new AppError("Vous n'êtes pas autorisé modifier les droits", {
              statusCode: 403,
            }),
          );
        }
      }
      log.i("DONE");
      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = checkPermissionFoRole;
