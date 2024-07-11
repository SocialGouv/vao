const logger = require("../../utils/logger");
const yup = require("yup");
const { updateSchemaAdapteur } = require("../../schemas/eig");
const { UpdateTypes } = require("../../helpers/eig");
const ValidationAppError = require("../../utils/validation-error");
const eigService = require("../../services/eig");

const log = logger(module.filename);

module.exports = async (req, res, next) => {
  const { id: userId } = req.decoded;
  const { id: eigId } = req.params;
  // La vérification de la non nullité de eigId est effectuée par le middleware checkPermissionEIG

  log.i("IN", { body: req.body });
  const { parametre, type } = req.body;

  let eig;

  try {
    eig = await yup.object(updateSchemaAdapteur(type)).validate(parametre, {
      abortEarly: false,
      stripUnknown: true,
    });
  } catch (error) {
    return next(new ValidationAppError(error));
  }
  try {
    let updatedEigId;
    switch (type) {
      case UpdateTypes.DECLARATION_SEJOUR:
        updatedEigId = await eigService.updateDS(eigId, {
          demandeSejourId: eig.demandeSejourId,
        });
        break;
      case UpdateTypes.TYPE_EVENEMENT:
        updatedEigId = await eigService.updateType(eigId, eig);
        break;
      case UpdateTypes.RENSEIGNEMENT_GENERAUX:
        updatedEigId = await eigService.updateRenseignementsGeneraux(
          eigId,
          eig,
        );
        break;
      default:
        throw new Error("Le type demandé n'existe pas");
    }

    return res.status(200).json({ id: updatedEigId, userId });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
