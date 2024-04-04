const AppError = require("../utils/error");
const logger = require("../utils/logger");

const log = logger(module.filename);

function checkRole(role) {
  return (req, res, next) => {
    const { roles } = req.decoded;
    log.i("IN", { role, roles });
    if (!roles || !Array.isArray(roles) || !roles.includes(role)) {
      return next(
        new AppError(`${role} est attendu`, {
          statusCode: 403,
        }),
      );
    }
    log.i("DONE");
    next();
  };
}

module.exports = checkRole;
