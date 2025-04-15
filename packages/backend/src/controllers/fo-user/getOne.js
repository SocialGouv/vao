const FoUser = require("../../services/FoUser");
const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function getOne(req, res, next) {
  log.i("IN");
  const { userId } = req.params;
  log.d("userId", { userId });
  try {
    const user = await FoUser.readOne(userId);
    log.d(user);
    return res.status(200).json({ user });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
