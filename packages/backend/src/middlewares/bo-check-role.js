const AppError = require("../utils/error");
const logger = require("../utils/logger");

const log = logger(module.filename);

function checkRole(expectedRoles) {
  return (req, res, next) => {
    const { roles } = req.decoded;
    log.i("IN", { expectedRoles, roles });
    if (
      !expectedRoles ||
      !roles ||
      !Array.isArray(roles) ||
      !roles.some((role) => expectedRoles.includes(role))
    ) {
      return next(
        new AppError(`Au moins un rôle parmi ${expectedRoles} est attendu`, {
          statusCode: 403,
        }),
      );
    }
    log.i("DONE");
    next();
  };
}

module.exports = checkRole;
