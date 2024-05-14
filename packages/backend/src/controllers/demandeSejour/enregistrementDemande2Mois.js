const DemandeSejour = require("../../services/DemandeSejour");
const PdfARDeclaration2Mois = require("../../services/pdf/ARdeclaration2mois/generate");

const logger = require("../../utils/logger");
const { statuts } = require("../../helpers/ds-statuts");
const MailUtils = require("../../utils/mail");
const AppError = require("../../utils/error");

const Send = require("../../services/mail").mailService.send;

const log = logger(module.filename);

module.exports = async function post(req, res, next) {
  const declarationId = req.params.declarationId;
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
    !req.departements.map((d) => d.value).includes(declaration.departementSuivi)
  ) {
    log.w("Administrator is not principal instructor");
    return next(
      new AppError(
        "L'administrateur n'est pas instructeur principal de la demande",
        {
          statusCode: 403,
        },
      ),
    );
  }

  if (declaration.statut !== statuts.EN_COURS) {
    return next(
      new AppError("Statut incompatible", {
        statusCode: 400,
      }),
    );
  }

  try {
    await PdfARDeclaration2Mois(declaration);

    const destinataires = await DemandeSejour.getEmailToList(
      declaration.organismeId,
    );

    await DemandeSejour.updateStatut(
      declarationId,
      statuts.ATTENTE_8_JOUR,
      {
        boUserId: userId,
        declarationId,
        metaData: declaration,
        source: `DDETS ${territoireCode}`,
        type: "declaration_sejour",
        typePrecision: "Enregistrement de la déclaration à 2 mois",
        userId: null,
      },
      () =>
        Send(
          MailUtils.usagers.declarationSejour.sendEnregistrementA2MoisMail({
            declaration,
            destinataires,
          }),
        ),
    );

    return res.status(200).end();
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
