const logger = require("../../utils/logger");
const FoUser = require("../../services/FoUser");

const log = logger(module.filename);

module.exports = async function getRoles(req, res, next) {
  log.i("IN");
  const { decoded } = req;
  const { id: userId } = decoded;
  log.d("userId", { userId });

  try {
    const userRole = await FoUser.getRolesByUserId({
      userId,
    });

    return res.status(200).json({ userRole });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
