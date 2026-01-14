const { schema } = require("../helpers/schema");
const commonCheckJWT = require("./common/checkJWT");

function checkJWT(req, res, next) {
  return commonCheckJWT(req, res, next, schema.FRONT, true);
}

module.exports = checkJWT;
