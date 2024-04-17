const Commune = require("../../services/geo/Commune");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = {
  fetch: async function fetch(req, res) {
    const { departement, date = null } = req.query;
    log.i("IN");
    const communes = await Commune.fetch({ date, departement });
    log.i("DONE");
    return res.json({ communes });
  },
  get: async function get(req, res) {
    log.i("IN");
    const { communeCode } = req.params;
    const { date = null } = req.query;
    const commune = await Commune.get({ code: communeCode, date });
    log.i("DONE");
    return res.json(commune);
  },
};
