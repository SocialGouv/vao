const DemandeSejour = require("../../services/DemandeSejour");
const AppError = require("../../utils/error");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function post(req, res, next) {
  const demandeSejourId = req.params.id;
  const { type, parametre } = req.body;
  log.i("IN", { demandeSejourId, parametre, type });

  if (!type || !demandeSejourId || !parametre) {
    log.w("missing parameter");
    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }

  try {
    const demandeId = await DemandeSejour.update(
      type,
      demandeSejourId,
      parametre,
    );

    log.i("DONE");
    return res.status(200).json({ id: demandeId });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
