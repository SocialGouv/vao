const axios = require("axios");

const logger = require("../../utils/logger");

const log = logger(module.filename);
const config = require("../../config");

module.exports = {
  fetch: async function fetch(req, res) {
    log.i("IN", req.body);

    const queryString = encodeURI(req.body.queryString);
    log.d(queryString);
    try {
      const url = `${config.apiAdresse.url}/search/?q=${queryString}`;
      axios
        .get(url)
        .then((response) => {
          log.d(response.data.features);
          res.json({ adresses: response.data.features });
        })
        .catch((error) => {
          log.w(error);
          res
            .status(400)
            .json({ message: "erreur lors de l'appel à l'API adresse" });
        });
    } catch (error) {
      log.w("DONE with error");
      return res
        .status(404)
        .json({ message: "erreur lors de l'appel à l'API adresse" });
    }
    return true;
  },
};
