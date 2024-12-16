const Hebergement = require("../../services/hebergement/Hebergement");
const AppError = require("../../utils/error");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function get(req, res, next) {
  log.i("IN");
  const hebergementSiren = req.params.siren;
  if (!hebergementSiren) {
    log.w("missing or invalid parameter");

    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }
  try {
    const hebergement = await Hebergement.getBySiren(hebergementSiren);
    log.d(hebergement);
    return res.status(200).json({ hebergement });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
