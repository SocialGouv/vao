const User = require("../../services/BoUser");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function getMe(req, res, next) {
  try {
    const { decoded } = req;
    log.i("IN");
    const user = await User.readOne(decoded.id);
    log.i("DONE", { user });
    return res.json({ user });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
