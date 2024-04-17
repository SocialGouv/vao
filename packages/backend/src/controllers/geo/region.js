const Regions = require("../../services/geo/Region");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = {
  fetch: async function fetch(req, res) {
    log.i("IN");
    const regions = await Regions.fetch();
    log.i("DONE");
    return res.json({ regions });
  },
};
