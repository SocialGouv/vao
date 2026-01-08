const { schema } = require("../helpers/schema");
const commonCheckJWT = require("./common/checkJWT");

function checkJWT({ checkCgu = true } = {}) {
  return (req, res, next) => {
    return commonCheckJWT(req, res, next, schema.BACK, checkCgu);
  };
}

module.exports = checkJWT;
