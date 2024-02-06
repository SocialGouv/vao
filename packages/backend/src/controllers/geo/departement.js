const Departement = require("../../services/geo/Departement");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = {
  fetch: async function fetch(req, res) {
    log.i("In");
    const departements = await Departement.fetch();
    log.i("Done");
    return res.json({ departements });
  },
};
