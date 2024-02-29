const DemandeSejour = require("../../services/DemandeSejour");
const Operateur = require("../../services/Operateur");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function post(req, res) {
  log.i("IN");
  const { id: userId } = req.decoded;
  const { libelle, dateDebut, dateFin, duree, periode, organisme } =
    req.body.parametre;
  log.d(libelle, dateDebut, dateFin, duree, periode, organisme);
  if (!dateDebut || !dateFin || !duree) {
    log.w("missing parameter");
    return res.status(400).json({ message: "paramètre manquant." });
  }

  try {
    const operateur = await Operateur.get({ "uo.use_id": userId });
    if (!operateur.complet) {
      log.w("operateur isn't fully filled");
      return res.status(400).json({
        message:
          "Vous devez compléter la fiche Organisme avant de saisir une demande de séjour",
      });
    }

    const idDemande = await DemandeSejour.create(
      operateur.operateurId,
      libelle,
      dateDebut,
      dateFin,
      duree,
      periode,
      operateur.protocoleTransport,
      operateur.protocoleSanitaire,
      organisme,
    );
    if (!idDemande) {
      return res.status(400).json({
        message: "une erreur est survenue durant la création de la demande",
      });
    }
    return res.status(200).json({ id: idDemande });
  } catch (error) {
    log.w(error);
    return res.status(400).json({
      messagee: "Une erreur est survenue durant la création de la demande",
    });
  }
};
