const { number, object } = require("yup");

const DemandeSejour = require("../../services/DemandeSejour");
const AppError = require("../../utils/error");

const logger = require("../../utils/logger");
const ValidationAppError = require("../../utils/validation-error");

const log = logger(module.filename);

module.exports = async function post(req, res, next) {
  let demandeSejourId = req.params.id;
  const { type } = req.body;
  let { parametre } = req.body;
  log.i("IN", { demandeSejourId, parametre, type });

  if (!type || !parametre) {
    log.w("missing parameter");
    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }

  try {
    demandeSejourId = await number().required().validate(demandeSejourId);
    parametre = await object().json().required().validate(parametre);
  } catch (error) {
    return next(new ValidationAppError(error));
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
