const { schema } = require("../helpers/schema");
const commonCheckJWT = require("./common/checkJWT");

function checkJWT(req, res, next) {
  return commonCheckJWT(req, res, next, schema.BACK, true);
}

module.exports = checkJWT;
