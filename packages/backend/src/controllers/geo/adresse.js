const axios = require("axios");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = {
  fetch: async function fetch(req, res) {
    log.i("In", req.body);
    const queryString = encodeURI(req.body.queryString);
    log.d(queryString);
    try {
      const url = `https://api-adresse.data.gouv.fr/search/?q=${queryString}`;
      axios
        .get(url)
        .then((response) => res.json({ adresses: response.data.features }))
        .catch((error) => {
          log.w(error);
        });
    } catch (error) {
      log.w(error);
    }
  },
};
