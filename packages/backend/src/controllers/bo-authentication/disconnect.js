const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function disconnect(req, res) {
  log.i("IN");

  res.clearCookie("VAO_access_token", {});
  res.clearCookie("VAO_refresh_token", {});

  log.i("DONE");
  return res.json({ message: "Déconnexion" });
};
