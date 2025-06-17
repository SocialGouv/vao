const User = require("../../services/User");

const logger = require("../../utils/logger");
const normalize = require("../../utils/normalize");

const log = logger(module.filename);

module.exports = async function getMe(req, res, next) {
  const { decoded } = req;
  log.i("IN");
  try {
    const users = await User.read({ mail: normalize(decoded.email) });
    if (users.length === 0) {
      log.w("Utilisateur inexistant");
      return res.status(404).json({ name: "UserNotFound" });
    }
    const [user] = users;
    log.d({ user });
    log.i("DONE");
    return res.json({ user });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
