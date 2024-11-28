const BoUser = require("../../services/BoUser");
const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function listUsersTerritoire(req, res, next) {
  log.i("IN");
  const territoireCode = req.params.territoireCode;
  try {
    const result = await BoUser.readTerritoires(territoireCode);
    log.d(result);
    return res.status(200).json(result);
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
