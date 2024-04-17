const yup = require("yup");

const Hebergement = require("../../services/Hebergement");
const logger = require("../../utils/logger");
const ValidationAppError = require("../../utils/validation-error");
const HebergementSchema = require("../../schemas/hebergement");
const AppError = require("../../utils/error");

const log = logger(module.filename);

module.exports = async function post(req, res, next) {
  const hebergementId = req.params.id;
  const { nom, coordonnees, informationsLocaux, informationsTransport } =
    req.body;
  log.i("IN", {
    coordonnees,
    hebergementId,
    informationsLocaux,
    informationsTransport,
    nom,
  });

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
    await Hebergement.update(hebergementId, hebergement);
    log.i("DONE");
    return res.sendStatus(200);
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
