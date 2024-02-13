const DemandeSejour = require("../../services/DemandeSejour");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function post(req, res) {
  log.i("IN");
  const {
    operateurId,
    libelle,
    dateDebut,
    dateFin,
    sejourItinerant,
    sejourEtranger,
    duree,
  } = req.body;
  if (!dateDebut || !dateFin || !duree) {
    log.w("missing parameter");
    return res.status(400).json({ message: "paramètre manquant." });
  }

  try {
    const idDemande = await DemandeSejour.create(
      operateurId,
      libelle,
      dateDebut,
      dateFin,
      sejourItinerant,
      sejourEtranger,
      duree
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
