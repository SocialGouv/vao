const DemandeSejour = require("../../services/DemandeSejour");

const logger = require("../../utils/logger");
const { DEMANDE_SEJOUR_STATUTS } = require("@vao/shared-bridge");
const MailUtils = require("../../utils/mail");
const AppError = require("../../utils/error");

const Send = require("../../services/mail").mailService.send;

const log = logger(module.filename);

module.exports = async function post(req, res, next) {
  const { declarationId } = req.params;
  const { id: userId, territoireCode } = req.decoded;
  const { commentaire } = req.body;
  log.i("IN", { declarationId }, req.body);

  if (!declarationId) {
    log.w("missing parameter");
    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }

  const declaration = await DemandeSejour.getOne({ "ds.id": declarationId });

  if (!declaration) {
    log.w("error while getting current declaration");
    return next(
      new AppError("Déclaration introuvable", {
        statusCode: 404,
      }),
    );
  }

  if (
    declaration.statut !== DEMANDE_SEJOUR_STATUTS.EN_COURS &&
    declaration.statut !== DEMANDE_SEJOUR_STATUTS.EN_COURS_8J
  ) {
    log.w("Delaration should be in statut EN COURS");
    return next(
      new AppError("Statut incompatible", {
        statusCode: 400,
      }),
    );
  }

  const RefuseType =
    declaration.statut === DEMANDE_SEJOUR_STATUTS.EN_COURS
      ? DEMANDE_SEJOUR_STATUTS.REFUSEE
      : DEMANDE_SEJOUR_STATUTS.REFUSEE_8J;
  const textTypePrecision =
    "Refus de la demande " +
    (declaration.statut === DEMANDE_SEJOUR_STATUTS.EN_COURS
      ? " 2 mois"
      : " 8 jours");
  try {
    const destinataires = await DemandeSejour.getEmailToList(
      declaration.organismeId,
    );

    await DemandeSejour.updateStatut(
      declarationId,
      RefuseType,
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
          MailUtils.usagers.declarationSejour.sendRefusMail({
            comment: commentaire,
            declaration,
            destinataires,
          }),
        ),
    );

    log.i("DONE");
    return res.status(200).end();
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
