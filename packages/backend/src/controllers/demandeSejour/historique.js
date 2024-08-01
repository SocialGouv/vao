const declarationSejour = require("../../services/DemandeSejour");
const AppError = require("../../utils/error");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function get(req, res, next) {
  log.i("IN");
  const { declarationId } = req.params;
  if (!declarationId) {
    log.w("missing or invalid parameter");

    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }
  try {
    const historique = await declarationSejour.historique(declarationId);
    log.d(historique);
    return res.status(200).json({ historique });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
