const Pays = require("../../services/geo/Pays");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = {
  fetch: async function fetch(req, res) {
    log.i("fetch - In");
    const pays = await Pays.fetch();
    log.i("fetch - Done");
    return res.json({ pays });
  },
  get: async function get(req, res) {
    log.i("get - In");
    const { paysCode } = req.params;
    const pays = await Pays.get(paysCode);
    log.i("get - Done");
    return res.json(pays);
  },
};
