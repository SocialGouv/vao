const DemandeSejour = require("../../services/DemandeSejour");
const Organisme = require("../../services/Organisme");
const { statuts } = require("../../helpers/ds-statuts");

const logger = require("../../utils/logger");
const AppError = require("../../utils/error");

const log = logger(module.filename);

module.exports = async function post(req, res, next) {
  const { declarationId } = req.params;
  const { id: userId } = req.decoded;

  log.i("IN", { declarationId });

  try {
    const organisme = await Organisme.getOne({
      use_id: userId,
    });
    const sourceDeclaration = await DemandeSejour.getOne({
      "ds.id": declarationId,
      "o.id": organisme.organismeId,
    });

    if (!sourceDeclaration) {
      log.w("DONE with error");
      return next(
        new AppError("Déclaration non trouvée", {
          statusCode: 404,
        }),
      );
    }

    if (
      sourceDeclaration.statut !== statuts.BROUILLON &&
      sourceDeclaration.statut !== statuts.TRANSMISE &&
      sourceDeclaration.statut !== statuts.EN_COURS &&
      sourceDeclaration.statut !== statuts.ANNULEE &&
      sourceDeclaration.statut !== statuts.ABANDONNEE
    ) {
      log.w("DONE with error");
      return next(
        new AppError("Le statut de la déclaration ne permet pas sa copie", {
          statusCode: 404,
        }),
      );
    }

    sourceDeclaration.files = sourceDeclaration.files?.files?.filter(
      (f) =>
        f.type !== "declaration_2_mois" && f.type !== "AR_declaration_2_mois",
    );

    const newDeclarationId = await DemandeSejour.copy(sourceDeclaration);
    if (!newDeclarationId) {
      log.w("DONE with error");
      return next(
        new AppError("Erreur de copie", {
          statusCode: 400,
        }),
      );
    }
    await DemandeSejour.insertEvent(
      "Organisateur",
      newDeclarationId,
      userId,
      null,
      "declaration_sejour",
      "creation",
      {},
    );
    log.i("DONE");

    return res.status(200).json({ declarationId: newDeclarationId });
  } catch (err) {
    log.w(err);
    if (err && err.code === "22001") {
      return next(
        new AppError(
          "Le libellé de la déclaration copiée dépasse la limite de 100 caractères.",
          { name: "LibelleTooLong", statusCode: 400 },
        ),
      );
    }
    return next(
      new AppError("Erreur lors de la duplication de la déclaration", {
        statusCode: 500,
      }),
    );
  }
};
