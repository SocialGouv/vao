const DemandeSejour = require("../../services/DemandeSejour");
const PdfARDeclaration2Mois = require("../../services/pdf/ARdeclaration2mois/generate");
const PdfARDeclaration8Jours = require("../../services/pdf/ARdeclaration8jours/generate");

const logger = require("../../utils/logger");
const { DEMANDE_SEJOUR_STATUTS } = require("@vao/shared-bridge");
const MailUtils = require("../../utils/mail");
const AppError = require("../../utils/error").default;

const Send = require("../../services/mail").mailService.send;

const log = logger(module.filename);

module.exports = async function post(req, res, next) {
  const { declarationId } = req.params;
  const { id: userId, territoireCode } = req.decoded;
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
    return next(
      new AppError("Demande de séjour non trouvé", {
        statusCode: 404,
      }),
    );
  }

  if (
    declaration.statut !== DEMANDE_SEJOUR_STATUTS.EN_COURS &&
    declaration.statut !== DEMANDE_SEJOUR_STATUTS.EN_COURS_8J
  ) {
    return next(
      new AppError("Statut incompatible", {
        statusCode: 400,
      }),
    );
  }
  const enCoursTypeStatut =
    declaration.statut === DEMANDE_SEJOUR_STATUTS.EN_COURS
      ? DEMANDE_SEJOUR_STATUTS.ATTENTE_8_JOUR
      : DEMANDE_SEJOUR_STATUTS.VALIDEE_8J;
  const textTypePrecision =
    "Enregistrement de la déclaration à " +
    (declaration.statut === DEMANDE_SEJOUR_STATUTS.EN_COURS
      ? " 2 mois"
      : " 8 jours");

  try {
    if (declaration.statut === DEMANDE_SEJOUR_STATUTS.EN_COURS)
      await PdfARDeclaration2Mois(declaration);
    else await PdfARDeclaration8Jours(declaration);

    const destinataires = await DemandeSejour.getEmailToList(
      declaration.organismeId,
    );

    await DemandeSejour.updateStatut(
      declarationId,
      enCoursTypeStatut,
      {
        boUserId: userId,
        declarationId,
        metaData: declaration,
        source: `DDETS ${territoireCode}`,
        type: "declaration_sejour",
        typePrecision: textTypePrecision,
        userId: null,
      },
      () =>
        declaration.statut === DEMANDE_SEJOUR_STATUTS.EN_COURS
          ? Send(
              MailUtils.usagers.declarationSejour.sendAccuseReception2MoisMail({
                declaration,
                destinataires,
              }),
            )
          : Send(
              MailUtils.usagers.declarationSejour.sendAccuseReception8JoursMail(
                {
                  declaration,
                  destinataires,
                },
              ),
            ),
    );

    if (declaration.statut === DEMANDE_SEJOUR_STATUTS.EN_COURS)
      await DemandeSejour.saveDS2M(declarationId, declaration);

    return res.status(200).end();
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
