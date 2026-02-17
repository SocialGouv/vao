const { number } = require("yup");
const ValidationAppError = require("../utils/validation-error").default;
const AppError = require("../utils/error").default;
const eigService = require("../services/eig");
const { statuts } = require("../helpers/eig");

async function canUpdateOrDeleteEig(req, _res, next) {
  let eigId = req.params.id;

  try {
    eigId = await number().required().validate(eigId);
  } catch (error) {
    return next(new ValidationAppError(error));
  }

  try {
    const statut = await eigService.getStatut(eigId);
    if ([statuts.BROUILLON].includes(statut)) {
      next();
    } else {
      next(
        new AppError(`l'eig est en lecture seule`, {
          name: "Bad statut",
          statusCode: 400,
        }),
      );
    }
  } catch (error) {
    next(error);
  }
}

module.exports = canUpdateOrDeleteEig;
