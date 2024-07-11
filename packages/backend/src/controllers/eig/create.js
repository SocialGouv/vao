const logger = require("../../utils/logger");
const yup = require("yup");
const { selectionSejourSchema } = require("../../schemas/eig");
const ValidationAppError = require("../../utils/validation-error");
const eigService = require("../../services/eig");
const DemandeSejour = require("../../services/DemandeSejour");
const { idDeclarationeligibleToEig } = require("../../helpers/eig");

const log = logger(module.filename);

module.exports = async (req, res, next) => {
  const { id: userId } = req.decoded;
  log.i("IN", { body: req.body });
  const { parametre } = req.body;

  let eig;

  try {
    eig = await yup.object(selectionSejourSchema).validate(parametre, {
      abortEarly: false,
      stripUnknown: true,
    });
  } catch (error) {
    return next(new ValidationAppError(error));
  }

  try {
    const ds = await DemandeSejour.getOne({ "ds.id": eig.demandeSejourId });
    if (!idDeclarationeligibleToEig(ds)) {
      return res.status(400).send({
        message: "La déclaration n'est pas éligible à la création d'un EIG",
      });
    }
  } catch (err) {
    return res.status(400).send({ errors: err.errors, name: err.name });
  }

  try {
    const eigId = await eigService.create({
      demandeSejourId: eig.demandeSejourId,
      userId,
    });
    return res.status(200).json({ id: eigId, userId });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
