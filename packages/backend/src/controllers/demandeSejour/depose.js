const dayjs = require("dayjs");
const DemandeSejour = require("../../services/DemandeSejour");
const Hebergement = require("../../services/Hebergement");
const Send = require("../../services/mail").mailService.send;
const MailUtils = require("../../utils/mail");

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

  try {
    const demande = await DemandeSejour.getOne({ "ds.id": demandeSejourId });
    if (!demande) {
      log.w("error while getting current demande");
      return res.status(400).json({
        message: "Une erreur est survenue durant la transmission de la demande",
      });
    }

    // TODO verif schema DS

    const firstHebergementId =
      demande.hebergement?.hebergements[0]?.hebergementId;
    if (!firstHebergementId) {
      log.w("error while getting first hebergementId");
      return res.status(400).json({
        message: "Une erreur est survenue durant la transmission de la demande",
      });
    }
    const hebergement = await Hebergement.getOne({ id: firstHebergementId });
    if (!hebergement) {
      log.w("error while getting first hebergement");
      return res.status(400).json({
        message: "Une erreur est survenue durant la transmission de la demande",
      });
    }
    const departementSuivi = hebergement?.coordonnees?.adresse?.departement;
    if (!departementSuivi) {
      log.w("error while getting departement");
      return res.status(400).json({
        message: "Une erreur est survenue durant la transmission de la demande",
      });
    }
    const numSeq = await DemandeSejour.getNextIndex();
    if (!numSeq) {
      log.w("error while getting next DS sequence value");
      return res.status(400).json({
        message: "Une erreur est survenue durant la transmission de la demande",
      });
    }
    const currentYear = dayjs(demande.dateDebut).format("YY");
    const idFonctionnelle = `DS-${currentYear}-${departementSuivi}-${numSeq.padStart(4, "0")}`;

    const demandeId = await DemandeSejour.update(
      "finalisation",
      demandeSejourId,
      {
        departementSuivi,
        idFonctionnelle,
      },
    );

    if (!demandeId) {
      log.w("update query returned null, demandeId expected");
      return res.status(400).json({
        message: "une erreur est survenue durant la sauvegarde de la demande",
      });
    }

    const eventId = await DemandeSejour.insertEvent(
      "organisme",
      demandeId,
      userId,
      "declaration_sejour",
      "depose à 2 mois",
      demande,
    );
    if (!eventId) {
      log.w("error while inserting event");
    }

    const destinataires = await DemandeSejour.getEmailToList(
      demande.organismeId,
    );
    const cc = await DemandeSejour.getEmailCcList(
      demande.organisme.personneMorale.siren ?? "personnePhysique",
    );
    if (destinataires) {
      await Send(
        MailUtils.usagers.declarationSejour.sendAR2mois({
          cc: cc,
          declaration: demande,
          dest: destinataires,
        }),
      );
    }
    return res.status(200).json({ id: demandeId });
  } catch (error) {
    log.w(error);
    return res.status(400).json({
      message: "Une erreur est survenue durant la mise à jour de la demande",
    });
  }
};
