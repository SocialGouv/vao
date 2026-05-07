const Commune = require("../../services/geo/Commune");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = {
  fetch: async function fetch(req, res, next) {
    try {
      const { departement, date = null } = req.query;
      const communes = await Commune.fetch({ date, departement });
      log.i("DONE");
      return res.json({ communes });
    } catch (error) {
      log.w("DONE with error");
      return next(error);
    }
  },
  get: async function get(req, res, next) {
    log.i("IN");
    const { communeCode } = req.params;
    const { date = null } = req.query;
    try {
      const commune = await Commune.get({ code: communeCode, date });
      log.i("DONE");
      return res.json(commune);
    } catch (error) {
      log.w("DONE with error");
      return next(error);
    }
  },
};
