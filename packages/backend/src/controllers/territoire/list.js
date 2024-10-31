const Territoire = require("../../services/Territoire");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function list(req, res) {
  log.i("IN");
  const territoires = await Territoire.fetch();
  log.i("DONE");
  return res.json({ territoires });
};
