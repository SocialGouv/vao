const logger = require("../../utils/logger");
const yup = require("yup");
const { updateSchemaAdapteur } = require("../../schemas/eig");
const { UpdateTypes, isDeclarationligibleToEig } = require("../../helpers/eig");
const ValidationAppError = require("../../utils/validation-error").default;
const eigService = require("../../services/eig");
const DemandeSejour = require("../../services/DemandeSejour");

const log = logger(module.filename);

module.exports = async (req, res, next) => {
  const { id: userId } = req.decoded;
  const { id: eigId } = req.params;
  // La vérification de la non nullité de eigId est effectuée par le middleware checkPermissionEIG

  log.i("IN", { body: req.body });
  const { parametre, type } = req.body;

  let ds;

  try {
    const checkEig = await eigService.getById({ eigId });
    ds = await DemandeSejour.getOne({
      "ds.id": parametre.declarationId ?? checkEig.declarationId,
    });
    if (!ds) {
      return res
        .status(404)
        .send({ errors: "Aucune déclaration trouvée", name: "Not found" });
    }
  } catch (err) {
    return res.status(500).send({ errors: err.errors, name: err.name });
  }

  if (!isDeclarationligibleToEig(ds)) {
    return res.status(400).send({
      message: "La déclaration n'est pas éligible à la création d'un EIG",
    });
  }

  let eig;

  try {
    eig = await yup
      .object(updateSchemaAdapteur(type, [ds.dateDebut, ds.dateFin]))
      .validate(parametre, {
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
          date: eig.date,
          declarationId: eig.declarationId,
          departement: eig.departement,
        });
        break;
      case UpdateTypes.FILE:
        updatedEigId = await eigService.updateFile(eigId, eig);
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
      case UpdateTypes.EMAIL_AUTRES_DESTINATAIRES:
        updatedEigId = await eigService.updateEmailAutresDestinataires(
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
