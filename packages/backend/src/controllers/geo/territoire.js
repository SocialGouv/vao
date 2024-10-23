const Territoire = require("../../services/geo/Territoire");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = {
  fetch: async function fetch(req, res) {
    log.i("IN");
    const territoires = await Territoire.fetch();
    console.log("territoires", territoires);
    log.i("DONE");
    return res.json({ territoires });
  },
  getOne: async function getOne(req, res) {
    log.i("IN");
    const { idTerritoire } = req.params;
    const territoires = await Territoire.readOne(idTerritoire);
    console.log("territoires", territoires);
    log.i("DONE");
    return res.json({ territoires });
  },

};
