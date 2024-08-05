const AppError = require("../../utils/error");
const eigService = require("../../services/eig");

const logger = require("../../utils/logger");
const { statuts } = require("../../helpers/eig");
const DemandeSejour = require("../../services/DemandeSejour");
const MailUtils = require("../../utils/mail");
const Send = require("../../services/mail").mailService.send;

const log = logger(module.filename);

module.exports = async function markAsRead(req, res, next) {
  const { id: eigId } = req.params;
  const { id: userId, territoireCode } = req.decoded;

  if (!eigId) {
    log.w("missing parameter");
    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }

  let eig;

  try {
    eig = await eigService.getById({ eigId });
  } catch (err) {
    return res.status(400).send({ errors: err.errors, name: err.name });
  }

  if (eig.statut !== statuts.ENVOYE) {
    log.w(
      "L'EIG n'as pas le statut envoyé et ne peux donc pas etre marqué comme lu",
    );
    return next(
      new AppError("Statut incompatible", {
        statusCode: 400,
      }),
    );
  }

  try {
    await eigService.markAsRead(eigId);
    await DemandeSejour.insertEvent(
      `DDETS/DREETS ${territoireCode}`,
      eig.declarationId,
      null,
      userId,
      "eig",
      `Lecture de l'eig ${eig.id}`,
      {},
    );
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }

  try {
    const destinataires = await DemandeSejour.getEmailToList(eig.organismeId);
    destinataires?.length &&
      (await Send(
        MailUtils.bo.eig.sendMarkAsRead({
          dest: destinataires,
          eig,
        }),
      ));
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }

  return res.status(200).json({ markAsRead: true });
};
