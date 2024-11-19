const yup = require("yup");
const Hebergement = require("../../services/hebergement/Hebergement");
const HebergementSchema = require("../../schemas/hebergement");
const logger = require("../../utils/logger");
const ValidationAppError = require("../../utils/validation-error");
const AppError = require("../../utils/error");
const FOUser = require("../../services/FoUser");

const log = logger(module.filename);

module.exports = async function post(req, res, next) {
  log.i("IN");
  const { body, decoded } = req;

  const { nom, coordonnees, informationsLocaux, informationsTransport } = body;
  const userId = decoded.id;

  log.d(userId);
  if (!nom || !coordonnees || !informationsLocaux || !informationsTransport) {
    log.w("missing or invalid parameter");

    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }

  let hebergement;
  try {
    hebergement = await yup.object(HebergementSchema.schema()).validate(
      {
        coordonnees,
        informationsLocaux,
        informationsTransport,
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
    const id = await Hebergement.create(userId, organismeId, hebergement);

    return res.status(200).json({
      id,
      message: "sauvegarde hebegement OK",
    });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
