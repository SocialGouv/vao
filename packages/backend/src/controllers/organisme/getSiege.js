const Organisme = require("../../services/Organisme");
const AppError = require("../../utils/error");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function get(req, res, next) {
  log.i("IN");
  const { siren } = req.params;
  if (!siren) {
    log.w("missing or invalid parameter");

    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }
  try {
    const organisme = await Organisme.getSiege(siren);
    log.d(organisme);
    return res.status(200).json({ organisme });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
