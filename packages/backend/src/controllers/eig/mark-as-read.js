const AppError = require("../../utils/error");
const eigService = require("../../services/eig");
const Departement = require("../../services/geo/Departement");
const Region = require("../../services/geo/Region");

const logger = require("../../utils/logger");
const {
  statuts,
  isUserDreetsWhoDeliveredAgrement,
  isUserDdetsWhereEigHappened,
  mustMarkAsRead,
} = require("../../helpers/eig");
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

  if (!mustMarkAsRead(territoireCode, eig)) {
    log.w("L'EIG n'as pas à être marqué comme lu par le user");
    return next(
      new AppError("Statut incompatible", {
        statusCode: 400,
      }),
    );
  }

  const typeReader = isUserDreetsWhoDeliveredAgrement(
    territoireCode,
    eig.agrementRegionObtention,
  )
    ? "DREETS"
    : isUserDdetsWhereEigHappened(territoireCode, eig.departement)
      ? "DDETS"
      : null;

  if (!typeReader) {
    return next(
      new AppError("L'utilisateur BO n'a aucune action a faire", {
        statusCode: 400,
      }),
    );
  }

  try {
    await eigService.markAsRead(eigId, typeReader);
    await DemandeSejour.insertEvent(
      `${typeReader} ${territoireCode}`,
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

  let territoireName;

  try {
    territoireName =
      typeReader === "DREETS"
        ? await Region.fetchOne(territoireCode)
        : await Departement.fetchOne(territoireCode);
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
          typeReader,
          territoireCode,
          territoireName: territoireName.text,
        }),
      ));
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }

  return res.status(200).json({ markAsRead: true });
};
