const DemandeSejour = require("../../services/DemandeSejour");
const Organisme = require("../../services/Organisme");
const { statuts } = require("../../helpers/ds-statuts");

const logger = require("../../utils/logger");
const AppError = require("../../utils/error");

const log = logger(module.filename);

module.exports = async function post(req, res, next) {
  const demandeSejourId = req.params.id;
  const { id: userId } = req.decoded;

  log.i("IN", { demandeSejourId });

  try {
    const organisme = await Organisme.getOne({
      use_id: userId,
    });
    const sourceDeclaration = await DemandeSejour.getOne({
      "ds.id": demandeSejourId,
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

    const demandeId = await DemandeSejour.copy(sourceDeclaration);
    if (!demandeId) {
      log.w("DONE with error");
      return next(
        new AppError("Erreur de copie", {
          statusCode: 400,
        }),
      );
    }
    await DemandeSejour.insertEvent(
      "Organisateur",
      demandeId,
      userId,
      null,
      "declaration_sejour",
      "creation",
      {},
    );
    log.i("DONE");

    return res.status(200).json({ demandeId });
  } catch (err) {
    log.w(err);
  }
};
