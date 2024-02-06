const axios = require("axios");
const config = require("../../config");

module.exports = async function get() {
  const cle = `${config.API_INSEE.CLIENT_ID}:${config.API_INSEE.CLIENT_SECRET}`;
  const authHeader = `Basic ${Buffer.from(cle).toString("base64")}`;
  const token = await axios.post(
    "https://api.insee.fr/token",
    {},
    {
      params: {
        grant_type: "client_credentials",
      },
      headers: {
        Authorization: authHeader,
        "Content-type": "application/x-www-form-urlencoded",
      },
    }
  );
  return token.data.access_token;
};
