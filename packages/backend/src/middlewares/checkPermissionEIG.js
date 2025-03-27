const logger = require("../utils/logger");
const AppError = require("../utils/error");
const { actions } = require("../helpers/tracking");
const { roles } = require("../helpers/users");

const log = logger(module.filename);

const Eig = require("../services/eig");
const User = require("../services/FoUser");

const ecriture = new Set([
  actions.creation,
  actions.modification,
  actions.deletion,
  actions.reading,
]);

async function hasPermission(userId, action) {
  try {
    const droits = await User.getRolesByUserId(userId);
    if (droits.length === 0) return false;

    return (
      (ecriture.has(action) &&
        droits.some((d) => d.label === roles.EIG_ECRITURE)) ||
      (action === actions.reading &&
        droits.some((d) => d.label === roles.EIG_LECTURE))
    );
  } catch (err) {
    log.w(err);
    throw new AppError(
      "Erreur lors du chargement des droits de l'utilisateur",
      { cause: err },
    );
  }
}

async function checkOrganismePermission(userId, eigId) {
  if (!eigId || isNaN(eigId)) {
    throw new AppError(
      !isNaN(eigId)
        ? "Invalid param type"
        : "Vous n'êtes pas autorisé à accéder à cet EIG",
      { statusCode: 403 },
    );
  }

  try {
    const isAllowedOrganisme = await Eig.getIsUserAllowedOrganisme(
      userId,
      eigId,
    );
    if (!isAllowedOrganisme) {
      throw new AppError(
        "Vous n'êtes pas autorisé à accéder à cet EIG pour cet organisme",
        { statusCode: 403 },
      );
    }
  } catch (err) {
    log.w(err);
    throw new AppError("Erreur lors du chargement des droits sur l'organisme", {
      cause: err,
    });
  }
}

function checkPermissionEIG({ action }) {
  return async (req, _res, next) => {
    try {
      const { id: userId } = req.decoded;
      const { id: eigId } = req.params;

      if (!(await hasPermission(userId, action))) {
        return next(
          new AppError("Vous n'êtes pas autorisé à accéder aux EIG", {
            statusCode: 403,
          }),
        );
      }

      if (action === actions.modification || action === actions.deletion) {
        await checkOrganismePermission(userId, eigId);
      }
      log.i("IN", { eigId, userId });
      log.i("DONE");
      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = checkPermissionEIG;
