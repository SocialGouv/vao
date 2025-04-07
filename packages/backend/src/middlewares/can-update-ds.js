const { number } = require("yup");
const ValidationAppError = require("../utils/validation-error");
const DemandeSejour = require("../services/DemandeSejour");
const Organisme = require("../services/Organisme");

const { statuts } = require("../helpers/ds-statuts");
const AppError = require("../utils/error");

async function canUpdateDs(req, _res, next) {
  let { declarationId } = req.params;
  const { id: userId } = req.decoded;
  let organisme;
  let sejour;

  try {
    declarationId = await number().required().validate(declarationId);
  } catch (error) {
    return next(new ValidationAppError(error));
  }

  try {
    organisme = await Organisme.getOne({
      use_id: userId,
    });
    sejour = await DemandeSejour.getById(declarationId);

    if (organisme.organismeId !== sejour.organismeId) {
      next(
        new AppError(
          `Organisme non autorisé à faire une mise à jour sur cette demande de séjour`,
          {
            name: "Not Authorized",
            statusCode: 403,
          },
        ),
      );
    }

    const statut = await DemandeSejour.getStatut(declarationId);
    if (
      [
        statuts.BROUILLON,
        statuts.A_MODIFIER,
        statuts.ATTENTE_8_JOUR,
        statuts.A_MODIFIER_8J,
        statuts.VALIDEE_8J,
        statuts.SEJOUR_EN_COURS,
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
