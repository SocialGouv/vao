const logger = require("../../utils/logger");
const yup = require("yup");
const { selectionSejourSchema } = require("../../schemas/eig");
const ValidationAppError = require("../../utils/validation-error");
const eigService = require("../../services/eig");
const DemandeSejour = require("../../services/DemandeSejour");
const { isDeclarationligibleToEig } = require("../../helpers/eig");

const log = logger(module.filename);

module.exports = async (req, res, next) => {
  const { id: userId } = req.decoded;
  log.i("IN", { body: req.body });
  const { parametre } = req.body;

  if (!parametre.declarationId) {
    return res.status(400).send({
      errors: "Le champs declarationId est obligatoire",
      name: "UnexpectedError",
    });
  }

  let ds;

  try {
    ds = await DemandeSejour.getOne({ "ds.id": parametre.declarationId });
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
      .object(selectionSejourSchema(ds.dateDebut, ds.dateFin))
      .validate(parametre, {
        abortEarly: false,
        stripUnknown: true,
      });
  } catch (error) {
    return next(new ValidationAppError(error));
  }

  try {
    const eigId = await eigService.create({
      date: eig.date,
      declarationId: eig.declarationId,
      departement: eig.departement,
      userId,
    });
    return res.status(200).json({ id: eigId, userId });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
