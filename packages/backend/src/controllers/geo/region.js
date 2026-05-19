const Regions = require("../../services/geo/Region");

const { logger } = require("../../utils/logger");

const log = logger(module.filename);

module.exports = {
  fetch: async function fetch(req, res, next) {
    try {
      const regions = await Regions.fetch();
      log.i("DONE");
      return res.json({ regions });
    } catch (error) {
      log.w("DONE with error");
      return next(error);
    }
  },
};
