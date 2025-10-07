const { DEMANDE_SEJOUR_STATUTS } = require("@vao/shared-bridge");
const DemandeSejour = require("../../services/DemandeSejour");
const Send = require("../../services/mail").mailService.send;
const MailUtils = require("../../utils/mail");
const logger = require("../../utils/logger");
const AppError = require("../../utils/error");

const log = logger(module.filename);

module.exports = async function cancel(req, res, next) {
  const { declarationId } = req.params;
  const { id: userId } = req.decoded;

  log.i("IN", { declarationId });
  let declaration;
  let canceletedRows;
  try {
    declaration = await DemandeSejour.getOne({
      "ds.id": declarationId,
    });

    if (!declaration) {
      log.w("DONE with error");
      return next(
        new AppError("Déclaration non trouvée", {
          statusCode: 404,
        }),
      );
    }
    log.i(declaration.statut);
    const statutsCancellable = [
      DEMANDE_SEJOUR_STATUTS.TRANSMISE,
      DEMANDE_SEJOUR_STATUTS.EN_COURS,
      DEMANDE_SEJOUR_STATUTS.A_MODIFIER,
      DEMANDE_SEJOUR_STATUTS.ATTENTE_8_JOUR,
      DEMANDE_SEJOUR_STATUTS.TRANSMISE_8J,
      DEMANDE_SEJOUR_STATUTS.EN_COURS_8J,
      DEMANDE_SEJOUR_STATUTS.A_MODIFIER_8J,
      DEMANDE_SEJOUR_STATUTS.VALIDEE_8J,
    ];

    if (!statutsCancellable.includes(declaration.statut)) {
      log.w("DONE with error");
      return next(
        new AppError(
          "Impossible d'annuler une demande qui n'est pas au bon statut",
          {
            statusCode: 400,
          },
        ),
      );
    }
    canceletedRows = await DemandeSejour.cancel(declaration.id, userId);
    if (canceletedRows !== 1) {
      log.w(
        `DONE with error, ${canceletedRows} rows were updated, expected one `,
      );
      return next(
        new AppError(
          "Erreur de l'annulation, trop de lignes mises à jour ou pas assez",
          {
            statusCode: 400,
          },
        ),
      );
    } else {
      await DemandeSejour.insertEvent(
        "Organisateur",
        declaration.id,
        userId,
        null,
        "declaration_sejour",
        "Annulation de la déclaration",
        declaration,
      );
    }
  } catch (err) {
    log.w(err);
    return next(
      new AppError("Erreur de l'annulation de la demande de sejour", {
        statusCode: 400,
      }),
    );
  }
  try {
    const destinatairesBack = await DemandeSejour.getEmailBack(
      declaration.departementSuivi,
    );

    if (destinatairesBack) {
      const departements = declaration.hebergement.hebergements.map(
        (h) => h.coordonnees.adresse.departement,
      );
      if (destinatairesBack.length > 0) {
        await Send(
          MailUtils.bo.declarationSejour.sendDeclarationCanceled({
            declaration,
            departementSuivi: declaration.departementSuivi,
            departementsSecondaires: departements.filter(
              (d) => d !== declaration.departementSuivi,
            ),
            destinataires: destinatairesBack,
          }),
        );
      }
    }
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

  try {
    const destinataires = await DemandeSejour.getEmailToList(
      declaration.organismeId,
    );

    await Send(
      MailUtils.usagers.declarationSejour.sendCanceledMail({
        declaration,
        destinataires,
      }),
    );

    log.i("DONE");
    return res.status(200).json({ canceletedRows });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
