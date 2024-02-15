const axios = require("axios");
const config = require("../../config");

module.exports = async function get() {
  const cle = `${config.API_INSEE.CLIENT_ID}:${config.API_INSEE.CLIENT_SECRET}`;
  const authHeader = `Basic ${Buffer.from(cle).toString("base64")}`;
  const token = await axios.post(
    "https://api.insee.fr/token",
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
