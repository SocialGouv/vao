const logger = require("../../../utils/logger");

const log = logger(module.filename);

module.exports = async function disconnect(req, res) {
  log.i("IN");

  res.clearCookie("PP_access_token", {});
  res.clearCookie("PP_refresh_token", {});

  log.i("DONE");
  return res.json({ message: "Déconnexion" });
};
