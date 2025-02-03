const Territoire = require("../../services/Territoire");
const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function list(req, res, next) {
  log.i("IN");
  try {
    const territoires = await Territoire.fetch(req.query);
    log.d(territoires);
    return res.status(200).json({
      territoires: territoires.rows,
      total: territoires.total,
    });
  } catch (error) {
    log.w(error);
    log.w("DONE with error");
    return next(error);
  }
};
