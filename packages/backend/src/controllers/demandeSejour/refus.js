const DemandeSejour = require("../../services/DemandeSejour");

const logger = require("../../utils/logger");
const { statuts } = require("../../helpers/ds-statuts");
const MailUtils = require("../../utils/mail");
const AppError = require("../../utils/error");

const Send = require("../../services/mail").mailService.send;

const log = logger(module.filename);

module.exports = async function post(req, res, next) {
  const declarationId = req.params.declarationId;
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
    log.w("Delaration should be in statut EN COURS");
    return next(
      new AppError("Statut incompatible", {
        statusCode: 400,
      }),
    );
  }

  try {
    const destinataires = await DemandeSejour.getEmailToList(
      declaration.organismeId,
    );

    await DemandeSejour.updateStatut(
      declarationId,
      statuts.REFUSEE,
      {
        boUserId: userId,
        declarationId,
        metaData: { commentaire },
        source: `DDETS ${territoireCode}`,
        type: "declaration_sejour",
        typePrecision: "Refus de la demande",
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
