const DemandeSejour = require("../../services/DemandeSejour");
const { statuts } = require("../../helpers/ds-statuts");

const logger = require("../../utils/logger");
const AppError = require("../../utils/error");

const log = logger(module.filename);

module.exports = async function post(req, res, next) {
  const declarationId = req.params.declarationId;
  const { id: userId, territoireCode } = req.decoded;
  log.i("IN", { declarationId });

  /** Ce controller gere le passage de la prise en charge d'une demande par un admin.
   * il ne peut etre appelé que :
   *  - pour un passage d'une demande TRANSMISE => EN COURS
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

  if (declaration.statut !== statuts.TRANSMISE) {
    log.w("Delaration is already at least in progress");
    return next(
      new AppError("Statut incompatible", {
        statusCode: 400,
      }),
    );
  }

  try {
    await DemandeSejour.updateStatut(declarationId, statuts.EN_COURS, {
      boUserId: userId,
      declarationId,
      metaData: declaration,
      source: `DDETS ${territoireCode}`,
      type: "declaration_sejour",
      typePrecision: "Prise en charge de la déclaration",
      userId: null,
    });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }

  return res.status(200).end();
};
