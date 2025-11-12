const axios = require("axios");
const config = require("../config");
const logger = require("../utils/logger");

const log = logger(module.filename);

module.exports.checkApiSearchAdresse = async () => {
  log.i("IN");
  const params = new URLSearchParams({
    limit: 1,
    q: "Paris",
  });
  const url = `${config.apiAdresse.url}/search?${params}`;
  try {
    const { data } = await axios.get(url);
    log.i("DONE");
    return data;
  } catch (error) {
    log.w("DONE With error");
    throw new Error(`API Entreprise error: ${error.message}`);
  }
};
