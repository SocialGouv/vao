const DemandeSejour = require("../../services/DemandeSejour");
const { statuts } = require("../../helpers/ds-statuts");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function post(req, res) {
  const demandeSejourId = req.params.id;
  const { id: userId } = req.decoded;
  log.i("IN", { demandeSejourId });

  if (!demandeSejourId) {
    log.w("missing parameter");
    return res.status(400).json({ message: "paramètre manquant." });
  }

  const declaration = await DemandeSejour.getOne({ "ds.id": demandeSejourId });

  if (!declaration) {
    log.w("error while getting current declaration");
    return res.status(400).json({
      message:
        "Une erreur est survenue durant la transmission de la declaration",
    });
  }

  console.log(`








  laaaaaaaaa`);

  if (declaration.statut !== statuts.TRANSMISE) {
    log.w("delaration is already at least in progress");
    return res.status(400).json({
      message: "La declaration est déjà en cours",
    });
  }

  if (
    !req.departements.map((d) => d.value).includes(declaration.departementSuivi)
  ) {
    log.w(
      "le departement de l'admin n'est pas le department de suivi de la déclaration",
    );
    return res.status(200).json({ statusChangeToEnCours: false });
  }

  console.log(
    `







  iciiiiiiiiii`,
    declaration,
    userId,
    req.departements.map((d) => d.value),
  );

  try {
    await DemandeSejour.update("statut", demandeSejourId, {
      statut: statuts.EN_COURS,
    });

    await DemandeSejour.insertEvent(
      "DDETS",
      demandeSejourId,
      null,
      userId,
      "declaration_sejour",
      "Prise en charge de la déclaration",
      declaration,
    );
    return res.status(200).json({ statusChangeToEnCours: true });
  } catch (error) {
    log.w(error);
    return res.status(400).json({
      message: "Une erreur est survenue durant la mise à jour de la demande",
    });
  }
};
