const logger = require("../../utils/logger");
const eigService = require("../../services/eig");
const yup = require("yup");
const { syntheseSchema } = require("../../schemas/eig");
const ValidationAppError = require("../../utils/validation-error");
const DemandeSejour = require("../../services/DemandeSejour");
const MailUtils = require("../../utils/mail");
const AppError = require("../../utils/error");
const { getEmails } = require("../../helpers/eigMail");
const Send = require("../../services/mail").mailService.send;

const log = logger(module.filename);

module.exports = async (req, res, next) => {
  const { id: eigId } = req.params;
  // La vérification de la non nullité de eigId est effectuée par le middleware checkPermissionEIG

  log.i("eig depose - IN");

  let eig;

  try {
    eig = await eigService.getById({ eigId });
    log.i("eig depose - OUT");
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }

  try {
    await yup.object(syntheseSchema).validate(eig, {
      abortEarly: false,
      stripUnknown: true,
    });
  } catch (error) {
    return next(new ValidationAppError(error));
  }

  try {
    await eigService.depose(eigId);
  } catch (error) {
    return next(new ValidationAppError(error));
  }

  try {
    await DemandeSejour.insertEvent(
      "Organisateur",
      eig.declarationId,
      eig.userId,
      null,
      "declaration_eig",
      "Dépot d'un eig",
      {},
    );
  } catch (error) {
    return next(new ValidationAppError(error));
  }

  try {
    const {
      emailsDDETS,
      emailsDREETS,
      emailsOrganisateur,
      departementName,
      regionName,
      userName,
    } = await getEmails(eig.departement, eig.userId);

    emailsDDETS?.length &&
      (await Send(
        MailUtils.bo.eig.sendToDDETS({
          dest: emailsDDETS,
          eig,
        }),
      ));

    emailsDREETS?.length > 0 &&
      (await Send(
        MailUtils.bo.eig.sendToDREETS({
          departementName,
          dest: emailsDREETS,
          eig,
        }),
      ));

    emailsOrganisateur?.length > 0 &&
      (await Send(
        MailUtils.bo.eig.sendToOrganisme({
          departementName,
          dest: emailsOrganisateur,
          eig,
          regionName,
          userName,
        }),
      ));

    eig.emailAutresDestinataires?.length > 0 &&
      (await Send(
        MailUtils.bo.eig.sendToAutre({
          departementName,
          dest: eig.emailAutresDestinataires,
          eig,
          regionName,
          userName,
        }),
      ));
  } catch (error) {
    log.w(error);
    return next(
      new AppError(
        "Une erreur est survenue lors de l'envoi de mails aux usagers back office",
        {
          statusCode: 500,
        },
      ),
    );
  }

  return res.status(200).json({ id: eigId });
};
