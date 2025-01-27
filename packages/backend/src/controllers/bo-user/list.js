const BoUser = require("../../services/BoUser");
const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function list(req, res, next) {
  log.i("IN");
  const { decoded } = req;
  const { id: adminId, territoireCode } = decoded ?? {};
  log.d("userId", { adminId });
  try {
    const result = await BoUser.getListe(req.query, territoireCode);
    log.d(result);
    return res.status(200).json(result);
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
