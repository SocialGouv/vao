const yup = require("yup");

const Hebergement = require("../../services/hebergement/Hebergement");
const logger = require("../../utils/logger");
const ValidationAppError = require("../../utils/validation-error").default;
const HebergementHelper = require("../../helpers/hebergement");
const HebergementSchema = require("../../schemas/hebergement");
const AppError = require("../../utils/error").default;

const log = logger(module.filename);

module.exports = async function post(req, res, next) {
  const hebergementId = req.params.id;
  const { body, decoded } = req;
  const userId = decoded.id;

  const { nom, coordonnees, informationsLocaux, informationsTransport } = body;

  if (
    !nom ||
    !coordonnees ||
    !informationsLocaux ||
    !informationsTransport ||
    !hebergementId
  ) {
    log.w("missing or invalid parameter");

    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }
  let hebergement;

  try {
    hebergement = await yup.object(HebergementSchema.schema(false)).validate(
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
    await Hebergement.update(
      userId,
      hebergementId,
      hebergement,
      HebergementHelper.statuts.ACTIF,
    );
    log.i("DONE");
    return res.sendStatus(200);
  } catch (error) {
    if (error.cause === "archive") {
      return next(new AppError(error));
    }
    log.w("DONE with error");
    return next(error);
  }
};
