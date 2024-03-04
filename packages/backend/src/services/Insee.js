const axios = require("axios");
const config = require("../config");
const logger = require("../utils/logger");

const log = logger(module.filename);

module.exports.getToken = async function () {
  log.i("In");
  const { apiInsee } = config;
  const cle = `${apiInsee.CLIENT_ID}:${apiInsee.CLIENT_SECRET}`;
  const authHeader = `Basic ${Buffer.from(cle).toString("base64")}`;
  const token = await axios.post(
    `${apiInsee.URL}/token`,
    {},
    {
      headers: {
        Authorization: authHeader,
        "Content-type": "application/x-www-form-urlencoded",
      },
      params: {
        grant_type: "client_credentials",
      },
    },
  );
  return token.data.access_token;
};
