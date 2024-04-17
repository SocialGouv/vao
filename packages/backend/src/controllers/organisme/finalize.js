const Organisme = require("../../services/Organisme");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function finalize(req, res, next) {
  const { id: userId } = req.decoded;
  log.i("IN", { userId });

  try {
    await Organisme.finalize(userId);
    log.i("DONE");
    return res.status(200).json({
      message: "sauvegarde organisme OK",
    });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
