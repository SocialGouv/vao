const { number } = require("yup");
const ValidationAppError = require("../utils/validation-error");
const DemandeSejour = require("../services/DemandeSejour");
const { statuts } = require("../helpers/ds-statuts");
const AppError = require("../utils/error");

async function canUpdateDs(req, _res, next) {
  let { declarationId } = req.params;

  try {
    declarationId = await number().required().validate(declarationId);
  } catch (error) {
    return next(new ValidationAppError(error));
  }

  try {
    const statut = await DemandeSejour.getStatut(declarationId);
    if (
      [
        statuts.BROUILLON,
        statuts.A_MODIFIER,
        statuts.ATTENTE_8_JOUR,
        statuts.A_MODIFIER_8J,
      ].includes(statut)
    ) {
      next();
    } else {
      next(
        new AppError(`La demande de séjour est en lecture seule`, {
          name: "Bad statut",
          statusCode: 409,
        }),
      );
    }
  } catch (error) {
    next(error);
  }
}

module.exports = canUpdateDs;
