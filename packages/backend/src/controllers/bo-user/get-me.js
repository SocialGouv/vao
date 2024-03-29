const User = require("../../services/BoUser");
// const Session = require("../../services/Session");

const logger = require("../../utils/logger");
const normalize = require("../../utils/normalize");

const log = logger(module.filename);

module.exports = async function getMe(req, res) {
  const { decoded } = req;
  log.i("In");
  const users = await User.read({ mail: normalize(decoded.email) });
  if (users.length === 0) {
    log.w("Utilisateur BO inexistant");
    return res.status(404).json({ code: "UserNotFound" });
  }

  const [user] = users;
  log.d({ user });

  // TODO : add validation
  log.i("Done");
  return res.json({ user });
};
