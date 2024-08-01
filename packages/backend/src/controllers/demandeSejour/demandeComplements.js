const { number } = require("yup");

const DemandeSejour = require("../../services/DemandeSejour");

const logger = require("../../utils/logger");
const { statuts } = require("../../helpers/ds-statuts");
const MailUtils = require("../../utils/mail");
const AppError = require("../../utils/error");
const ValidationAppError = require("../../utils/validation-error");

const Send = require("../../services/mail").mailService.send;

const log = logger(module.filename);

module.exports = async function post(req, res, next) {
  let { declarationId } = req.params;
  const { id: userId, territoireCode } = req.decoded;
  const { commentaire } = req.body;
  log.i("IN", { declarationId }, req.body);

  try {
    declarationId = await number().required().validate(declarationId);
  } catch (error) {
    return next(new ValidationAppError(error));
  }

  const declaration = await DemandeSejour.getOne({ "ds.id": declarationId });

  if (!declaration) {
    log.w("error while getting current declaration");
    return next(
      new AppError(
        "Une erreur est survenue durant la transmission de la declaration",
        {
          statusCode: 404,
        },
      ),
    );
  }

  if (
    declaration.statut !== statuts.EN_COURS &&
    declaration.statut !== statuts.EN_COURS_8J
  ) {
    log.w("Declaration should be in statut EN COURS");
    return res.status(400).json({
      message: "Statut non compatible",
    });
  }

  const AModifierType =
    declaration.statut === statuts.EN_COURS
      ? statuts.A_MODIFIER
      : statuts.A_MODIFIER_8J;
  const textTypePrecision =
    "Demande de compléments " +
    (declaration.statut === statuts.EN_COURS ? " 2 mois" : " 8 jours");
  try {
    const destinataires = await DemandeSejour.getEmailToList(
      declaration.organismeId,
    );

    await DemandeSejour.updateStatut(
      declarationId,
      AModifierType,
      {
        boUserId: userId,
        declarationId,
        metaData: { commentaire },
        source: `DDETS ${territoireCode}`,
        type: "declaration_sejour",
        typePrecision: textTypePrecision,
        userId: null,
      },
      () =>
        Send(
          MailUtils.usagers.declarationSejour.sendACompleterMail({
            comment: commentaire,
            declaration,
            destinataires,
            territoireCode,
          }),
        ),
    );

    return res.status(200).end();
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
