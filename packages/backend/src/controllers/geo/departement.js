const Departement = require("../../services/geo/Departement");

const { logger } = require("../../utils/logger");

const log = logger(module.filename);

module.exports = {
  fetch: async function fetch(req, res, next) {
    log.i("IN");
    try {
      const departements = await Departement.fetch();
      log.i("DONE");
      return res.json({ departements });
    } catch (error) {
      log.w("DONE with error");
      return next(error);
    }
  },
};
