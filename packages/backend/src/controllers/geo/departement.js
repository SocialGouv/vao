const Departement = require("../../services/geo/Departement");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = {
  fetch: async function fetch(req, res) {
    log.i("IN");
    const departements = await Departement.fetch();
    log.i("DONE");
    return res.json({ departements });
  },
};
