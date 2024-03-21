const DemandeSejour = require("../../services/DemandeSejour");
const Organisme = require("../../services/Organisme");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function post(req, res) {
  log.i("IN");
  const { id: userId } = req.decoded;
  const {
    libelle,
    dateDebut,
    dateFin,
    duree,
    periode,
    responsableSejour,
    organisme,
  } = req.body.parametre;
  log.d({
    dateDebut,
    dateFin,
    duree,
    libelle,
    organisme,
    periode,
    responsableSejour,
  });
  if (!dateDebut || !dateFin || !duree) {
    log.w("missing parameter");
    return res.status(400).json({ message: "paramètre manquant." });
  }

  try {
    const organisme = await Organisme.get({ "uo.use_id": userId });
    if (!organisme.complet) {
      log.w("organisme isn't fully filled");
      return res.status(400).json({
        message:
          "Vous devez compléter la fiche Organisme avant de saisir une demande de séjour",
      });
    }

    if (
      organisme.typeOrganisme === "personne_morale" &&
      organisme.personneMorale?.siegeSocial === false
    ) {
      const siege = await Organisme.getSiege(organisme.personneMorale.siret);
      if (!siege)
        log.w("error while getting infos from etablissement principal");
      else {
        organisme.protocoleTransport = siege.protocoleTransport;
        organisme.protocoleSanitaire = siege.protocoleSanitaire;
      }
    }

    const demandeId = await DemandeSejour.create(
      organisme.organismeId,
      libelle,
      dateDebut,
      dateFin,
      duree,
      periode,
      responsableSejour,
      organisme.protocoleTransport,
      organisme.protocoleSanitaire,
      organisme,
    );
    if (!demandeId) {
      return res.status(400).json({
        message: "une erreur est survenue durant la création de la demande",
      });
    }
    return res.status(200).json({ id: demandeId });
  } catch (error) {
    log.w(error);
    return res.status(400).json({
      messagee: "Une erreur est survenue durant la création de la demande",
    });
  }
};
