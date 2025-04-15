const logger = require("../../utils/logger");
const FoUser = require("../../services/FoUser");

const log = logger(module.filename);

module.exports = async function updateRoles(req, res, next) {
  log.i("IN");
  const userId = req.params.userId;
  const roles = req.body.roles;
  try {
    const userRole = await FoUser.updateRoles(userId, roles);
    return res.status(200).json({ userRole });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
