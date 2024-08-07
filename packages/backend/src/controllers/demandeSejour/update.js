const { number, object } = require("yup");

const DemandeSejour = require("../../services/DemandeSejour");
const AppError = require("../../utils/error");

const logger = require("../../utils/logger");
const ValidationAppError = require("../../utils/validation-error");

const log = logger(module.filename);

module.exports = async function post(req, res, next) {
  let { declarationId } = req.params;
  const { type } = req.body;
  let { parametre } = req.body;
  log.i("IN", { declarationId, parametre, type });

  if (!type || !parametre) {
    log.w("missing parameter");
    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }

  try {
    declarationId = await number().required().validate(declarationId);
    parametre = await object().json().required().validate(parametre);
  } catch (error) {
    return next(new ValidationAppError(error));
  }

  try {
    const updatedDeclarationId = await DemandeSejour.update(
      type,
      declarationId,
      parametre,
    );

    log.i("DONE");
    return res.status(200).json({ id: updatedDeclarationId });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
