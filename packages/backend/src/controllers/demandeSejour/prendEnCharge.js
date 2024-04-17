const DemandeSejour = require("../../services/DemandeSejour");
const { statuts } = require("../../helpers/ds-statuts");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function post(req, res) {
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
    return res.status(400).json({ message: "paramètre manquant." });
  }

  const declaration = await DemandeSejour.getOne({ "ds.id": declarationId });

  if (!declaration) {
    log.w("error while getting current declaration");
    return res.status(400).json({
      message:
        "Une erreur est survenue durant la transmission de la declaration",
    });
  }

  if (
    !req.departements.map((d) => d.value).includes(declaration.departementSuivi)
  ) {
    log.w("Administrator is not principal instructor");
    return res.status(403).json({
      message: "L'administrateur n'est pas instructeur principal de la demande",
    });
  }

  if (declaration.statut !== statuts.TRANSMISE) {
    log.w("Delaration is already at least in progress");
    return res.status(400).json({
      message: "Statut non compatible",
    });
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

    return res.status(200).end();
  } catch (error) {
    log.w(error);
    return res.status(400).json({
      message: "Une erreur est survenue durant la mise à jour de la demande",
    });
  }
};
