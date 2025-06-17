const { schema } = require("../helpers/schema");
const commonCheckJWT = require("./common/checkJWT");

async function checkJWT(req, res, next) {
  return commonCheckJWT(req, res, next, schema.FRONT);
}

module.exports = checkJWT;
