const { number } = require("yup");
const DemandeSejour = require("../../services/DemandeSejour");
const AppError = require("../../utils/error").default;
const logger = require("../../utils/logger");
const ValidationAppError = require("../../utils/validation-error").default;

const log = logger(module.filename);

module.exports = async function get(req, res, next) {
  log.i("IN");
  let { declarationId } = req.params;

  if (!declarationId) {
    log.w("missing or invalid parameter");

    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }

  try {
    declarationId = await number().required().validate(declarationId);
  } catch (error) {
    return next(new ValidationAppError(error));
  }

  try {
    const demande = await DemandeSejour.getOne({ "ds.id": declarationId });
    log.d(demande);
    return res.status(200).json({ demande });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
