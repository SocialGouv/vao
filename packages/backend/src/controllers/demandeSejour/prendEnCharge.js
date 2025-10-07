const DemandeSejour = require("../../services/DemandeSejour");
const { DEMANDE_SEJOUR_STATUTS } = require("@vao/shared-bridge");

const logger = require("../../utils/logger");
const AppError = require("../../utils/error");

const log = logger(module.filename);

module.exports = async function post(req, res, next) {
  const { declarationId } = req.params;
  const { id: userId, territoireCode } = req.decoded;
  log.i("IN", { declarationId });

  /** Ce controller gere le passage de la prise en charge d'une demande par un admin.
   * il ne peut etre appelé que :
   *  - pour un passage d'une demande TRANSMISE => EN COURS
   *  - pour un passage d'une demande TRANSMISE 8J => EN COURS 8J
   *  - par un instructeur principal de la demande (le premier hebergement est dans le département de l'admin)
   */

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
      new AppError("Demande de séjour non trouvée", {
        statusCode: 404,
      }),
    );
  }

  if (
    declaration.statut !== DEMANDE_SEJOUR_STATUTS.TRANSMISE &&
    declaration.statut !== DEMANDE_SEJOUR_STATUTS.TRANSMISE_8J
  ) {
    log.w("Declaration is already at least in progress");
    return next(
      new AppError("Statut incompatible", {
        statusCode: 400,
      }),
    );
  }
  const enCoursTypeStatut =
    declaration.statut === DEMANDE_SEJOUR_STATUTS.TRANSMISE
      ? DEMANDE_SEJOUR_STATUTS.EN_COURS
      : DEMANDE_SEJOUR_STATUTS.EN_COURS_8J;
  const textTypePrecision =
    "Prise en charge de la déclaration " +
    (declaration.statut === DEMANDE_SEJOUR_STATUTS.TRANSMISE
      ? " 2 mois"
      : " 8 jours");

  try {
    await DemandeSejour.updateStatut(declarationId, enCoursTypeStatut, {
      boUserId: userId,
      declarationId,
      metaData: declaration,
      source: `DDETS ${territoireCode}`,
      type: "declaration_sejour",
      typePrecision: textTypePrecision,
      userId: null,
    });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }

  return res.status(200).end();
};
