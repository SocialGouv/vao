const Organisme = require("../../services/Organisme");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function get(req, res, next) {
  log.i("IN");
  const { decoded } = req;
  const { id: userId } = decoded;
  try {
    const organisme = await Organisme.get({
      use_id: userId,
    });
    return res.status(200).json({ organisme });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
