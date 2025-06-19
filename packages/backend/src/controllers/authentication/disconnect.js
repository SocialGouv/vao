const { schema } = require("../../helpers/schema");
const commonDisconnect = require("../common/authentication/disconnect");

module.exports = async function disconnect(req, res) {
  return commonDisconnect(req, res, schema.FRONT);
};
