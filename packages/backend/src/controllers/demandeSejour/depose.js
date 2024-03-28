const dayjs = require("dayjs");
const yup = require("yup");

const DemandeSejour = require("../../services/DemandeSejour");
const Hebergement = require("../../services/Hebergement");
const Send = require("../../services/mail").mailService.send;
const PdfDeclaration2Mois = require("../../services/pdf/declaration2mois/generate");
const PdfARDeclaration2Mois = require("../../services/pdf/ARdeclaration2mois/generate");

const DeclarationSejourSchema = require("../../schemas/declaration-sejour");

const MailUtils = require("../../utils/mail");
const logger = require("../../utils/logger");
const ValidationAppError = require("../../utils/validation-error");

const log = logger(module.filename);

module.exports = async function post(req, res, next) {
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

  let declaration, declarationId, DSuuid, ARuuid;

  declaration = await DemandeSejour.getOne({ "ds.id": demandeSejourId });

  if (!declaration) {
    log.w("error while getting current declaration");
    return res.status(400).json({
      message:
        "Une erreur est survenue durant la transmission de la declaration",
    });
  }

  const { dateDebut, dateFin } = declaration;
  Object.assign(declaration, { attestation });

  try {
    log.d("finalize - before validation", { declaration });
    declaration = await yup
      .object(DeclarationSejourSchema(dateDebut, dateFin))
      .validate(declaration, {
        abortEarly: false,
        stripUnknown: true,
      });

    log.d("finalize - after validation", { declaration });

    declaration.attestation.at = dayjs(declaration.attestation.at).format(
      "YYYY-MM-DD",
    );
    declaration.dateDebut = dayjs(declaration.dateDebut).format("YYYY-MM-DD");
    declaration.dateFin = dayjs(declaration.dateFin).format("YYYY-MM-DD");
  } catch (error) {
    return next(new ValidationAppError(error));
  }

  const firstHebergementId =
    declaration.hebergement.hebergements[0].hebergementId;

  const hebergement = await Hebergement.getOne({ id: firstHebergementId });
  if (!hebergement) {
    log.w("error while getting first hebergement");
    return res.status(400).json({
      message:
        "Une erreur est survenue durant la transmission de la declaration",
    });
  }
  const departementSuivi = hebergement.coordonnees.adresse.departement;

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
  const idFonctionnelle = `DS-${currentYear}-${departementSuivi}-${numSeq.padStart(4, "0")}`;

  await DemandeSejour.finalize(
    demandeSejourId,
    departementSuivi,
    idFonctionnelle,
    declaration,
  );

  declaration = await DemandeSejour.getOne({ "ds.id": demandeSejourId });

  const eventId = await DemandeSejour.insertEvent(
    "organisme",
    demandeSejourId,
    userId,
    "declaration_sejour",
    "depose à 2 mois",
    declaration,
  );
  if (!eventId) {
    log.w("error while inserting event");
  }

  try {
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
      message: "Une erreur est survenue lors de l'envoi de mails",
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
