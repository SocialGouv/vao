const yup = require("yup");
const Hebergement = require("../../services/hebergement/Hebergement");
const HebergementHelper = require("../../helpers/hebergement");
const HebergementSchema = require("../../schemas/hebergement");
const logger = require("../../utils/logger");
const ValidationAppError = require("../../utils/validation-error");
const FOUser = require("../../services/FoUser");

const log = logger(module.filename);

module.exports = async function postbrouillon(req, res, next) {
  log.i("postbrouillon - IN");
  const { body, decoded } = req;

  const { nom, coordonnees, informationsLocaux, informationsTransport } = body;

  const userId = decoded.id;

  let hebergement;
  try {
    hebergement = await yup.object(HebergementSchema.schema(true)).validate(
      {
        coordonnees: coordonnees ?? {},
        informationsLocaux: informationsLocaux ?? {},
        informationsTransport: informationsTransport ?? {},
        nom,
      },
      {
        abortEarly: false,
        stripped: true,
      },
    );
  } catch (error) {
    return next(new ValidationAppError(error));
  }

  try {
    const organismeId = await FOUser.getUserOrganisme(userId);
    const id = await Hebergement.create(
      userId,
      organismeId,
      HebergementHelper.statuts.BROUILLON,
      hebergement,
    );

    return res.status(200).json({
      id,
      message: "sauvegarde hebegement OK",
    });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
