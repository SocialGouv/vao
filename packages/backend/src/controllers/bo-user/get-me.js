const User = require("../../services/BoUser");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function getMe(req, res) {
  const { decoded } = req;
  log.i("In");
  const user = await User.readOne(decoded.id);
  log.i("Done", { user });
  return res.json({ user });
};
