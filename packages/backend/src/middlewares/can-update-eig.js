const { number } = require("yup");
const ValidationAppError = require("../utils/validation-error");
const AppError = require("../utils/error");
const eigService = require("../services/eig");
const { statuts } = require("../helpers/eig");

async function canUpdateEig(req, _res, next) {
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

module.exports = canUpdateEig;
