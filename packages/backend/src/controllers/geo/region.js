const Regions = require("../../services/geo/Region");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = {
  fetch: async function fetch(req, res) {
    log.i("In");
    const regions = await Regions.fetch();
    log.i("Done");
    return res.json({ regions });
  },
};
