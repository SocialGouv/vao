const dayjs = require("dayjs");
const DemandeSejour = require("../../services/DemandeSejour");
const Hebergement = require("../../services/Hebergement");
const Send = require("../../services/mail").mailService.send;
const MailUtils = require("../../utils/mail");
const PdfDeclaration2Mois = require("../../services/pdf/declaration2mois/generate");
const PdfARDeclaration2Mois = require("../../services/pdf/ARdeclaration2mois/generate");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function post(req, res) {
  const demandeSejourId = req.params.id;
  const { id: userId } = req.decoded;
  const { attestation } = req.body;
  log.i("IN", { demandeSejourId });

  if (!demandeSejourId) {
    log.w("missing parameter");
    return res.status(400).json({ message: "paramètre manquant." });
  }

  if (!attestation) {
    log.w("missing parameter");
    return res.status(400).json({ message: "paramètre manquant." });
  }

  let declaration,
    declarationId,
    departementSuivi,
    idFonctionnelle,
    DSuuid,
    ARuuid;
  try {
    declaration = await DemandeSejour.getOne({ "ds.id": demandeSejourId });
    if (!declaration) {
      log.w("error while getting current declaration");
      return res.status(400).json({
        message:
          "Une erreur est survenue durant la transmission de la declaration",
      });
    }

    // TODO verif schema DS

    const firstHebergementId =
      declaration.hebergement?.hebergements[0]?.hebergementId;
    if (!firstHebergementId) {
      log.w("error while getting first hebergementId");
      return res.status(400).json({
        message:
          "Une erreur est survenue durant la transmission de la declaration",
      });
    }
    const hebergement = await Hebergement.getOne({ id: firstHebergementId });
    if (!hebergement) {
      log.w("error while getting first hebergement");
      return res.status(400).json({
        message:
          "Une erreur est survenue durant la transmission de la declaration",
      });
    }
    departementSuivi = hebergement?.coordonnees?.adresse?.departement;
    if (!departementSuivi) {
      log.w("error while getting departement");
      return res.status(400).json({
        message:
          "Une erreur est survenue durant la transmission de la declaration",
      });
    }
    const numSeq = await DemandeSejour.getNextIndex();
    if (!numSeq) {
      log.w("error while getting next DS sequence value");
      return res.status(400).json({
        message:
          "Une erreur est survenue durant la transmission de la declaration",
      });
    }
    const currentYear = dayjs(declaration.dateDebut).format("YY");
    idFonctionnelle = `DS-${currentYear}-${departementSuivi}-${numSeq.padStart(4, "0")}`;

    declarationId = await DemandeSejour.update(
      "finalisation",
      demandeSejourId,
      {
        attestation,
        departementSuivi,
        idFonctionnelle,
      },
    );

    if (!declarationId) {
      log.w("update query returned null, declarationId expected");
      return res.status(400).json({
        message:
          "une erreur est survenue durant la sauvegarde de la declaration",
      });
    }

    const eventId = await DemandeSejour.insertEvent(
      "organisme",
      declarationId,
      userId,
      "declaration_sejour",
      "depose à 2 mois",
      declaration,
    );
    if (!eventId) {
      log.w("error while inserting event");
    }

    const destinataires = await DemandeSejour.getEmailToList(
      declaration.organismeId,
    );
    const cc = await DemandeSejour.getEmailCcList(
      declaration.organisme.personneMorale.siren ?? "personnePhysique",
    );
    if (destinataires) {
      await Send(
        MailUtils.usagers.declarationSejour.sendAR2mois({
          cc: cc,
          declaration,
          dest: destinataires,
        }),
      );
    }
  } catch (error) {
    log.w(error);
    return res.status(400).json({
      message:
        "Une erreur est survenue durant la mise à jour de la declaration",
    });
  }
  try {
    DSuuid = await PdfDeclaration2Mois(
      declaration,
      idFonctionnelle,
      departementSuivi,
    );
  } catch (error) {
    log.w(error);
  }
  try {
    ARuuid = await PdfARDeclaration2Mois(
      declaration,
      idFonctionnelle,
      departementSuivi,
    );
  } catch (err) {
    log.w(err);
  }
  log.i(declarationId, DSuuid, ARuuid);
  return res.status(200).json({ ARuuid, DSuuid, declarationId });
};
