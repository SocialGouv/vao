const Territoire = require("../../services/Territoire");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function getOne(req, res) {
  log.i("IN");
  const { idTerritoire } = req.params;
  const territoires = await Territoire.readOne(idTerritoire);
  //console.log("territoires", territoires);
  log.i("DONE");
  return res.json({ territoires });
};
