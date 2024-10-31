const Territoire = require("../../services/Territoire");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function update(req, res) {
  log.i("IN");
  console.log("req.params", req.decoded);
  const { id, territoireCode } = req.params;
  const { userTerritoireCode } = req.decoded;
  console.log("territoireCode : ", territoireCode);
  let response;
  if (userTerritoireCode === "FRA" || territoireCode === userTerritoireCode) {
    response = await Territoire.update(id, req.body);
    console.log("territoires", response);
  } else response = "UnAuthorized";
  log.i("DONE");
  return res.json({ response });
};
