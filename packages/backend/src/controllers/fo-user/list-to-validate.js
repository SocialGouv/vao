const FoUser = require("../../services/FoUser");
const BoUser = require("../../services/BoUser");
const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function listToValidateParTerritoire(req, res, next) {
  log.i("IN");
  const { decoded } = req;
  const { id: userId } = decoded;
  log.d("userId", { userId });

  try {
    const boUser = await BoUser.getByUserId(userId);
    const { total, users } = await FoUser.getByToValidateByBo(
      boUser.territoireCode,
    );
    log.d(users);
    return res.status(200).json({
      total: total,
      users: users,
    });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
