const dayjs = require("dayjs");
const yup = require("yup");

const DemandeSejour = require("../../services/DemandeSejour");
const Hebergement = require("../../services/hebergement/Hebergement");
const Send = require("../../services/mail").mailService.send;
const PdfDeclaration2Mois = require("../../services/pdf/declaration2mois/generate");
const PdfDeclaration8jours = require("../../services/pdf/declaration8jours/generate");

const Sentry = require("@sentry/node");
const { sentry } = require("../../config");

const {
  schema: DeclarationSejourSchema,
} = require("../../schemas/declaration-sejour");

const MailUtils = require("../../utils/mail");
const logger = require("../../utils/logger");
const ValidationAppError = require("../../utils/validation-error").default;
const { DEMANDE_SEJOUR_STATUTS } = require("@vao/shared-bridge");
const AppError = require("../../utils/error").default;

const log = logger(module.filename);

const expectedStates = [
  DEMANDE_SEJOUR_STATUTS.BROUILLON,
  DEMANDE_SEJOUR_STATUTS.A_MODIFIER,
  DEMANDE_SEJOUR_STATUTS.ATTENTE_8_JOUR,
  DEMANDE_SEJOUR_STATUTS.A_MODIFIER_8J,
  DEMANDE_SEJOUR_STATUTS.VALIDEE_8J,
  DEMANDE_SEJOUR_STATUTS.SEJOUR_EN_COURS,
];

module.exports = async function post(req, res, next) {
  const { declarationId } = req.params;
  const { id: userId } = req.decoded;
  const { attestation } = req.body;
  log.i("IN", { declarationId });

  try {
    await yup.number().required().validate(declarationId);
  } catch (error) {
    return next(new ValidationAppError(error));
  }

  if (!attestation) {
    log.w("DONE with error");
    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }

  let declaration, DSuuid, ARuuid;

  declaration = await DemandeSejour.getOne({ "ds.id": declarationId });
  let idFonctionnelle = declaration.idFonctionnelle;

  if (!declaration) {
    log.w("DONE with error");
    return next(
      new AppError("Déclaration non trouvée", {
        statusCode: 404,
      }),
    );
  }
  const { dateDebut, dateFin, statut } = declaration;

  if (!expectedStates.includes(statut)) {
    log.w("Unexpected states", { expectedStates, statut });
    return next(
      new AppError("Statut incomptabile", {
        statusCode: 400,
      }),
    );
  }

  const dateDeposeA2mois = declaration.declaration2mois?.attestation?.at ?? "";
  const firstSubmit = statut === DEMANDE_SEJOUR_STATUTS.BROUILLON;

  Object.assign(declaration, { attestation });

  try {
    log.i("finalize - before validation", { declaration });
    declaration = await yup
      .object(DeclarationSejourSchema(dateDebut, dateFin, statut))
      .validate(declaration, {
        abortEarly: false,
        stripUnknown: true,
      });

    log.i("finalize - after validation", { declaration });
    log.d(declaration.informationsPersonnel);
    declaration.attestation.at = dayjs(declaration.attestation.at).format(
      "YYYY-MM-DD",
    );
    declaration.dateDebut = dayjs(declaration.dateDebut).format("YYYY-MM-DD");
    declaration.dateFin = dayjs(declaration.dateFin).format("YYYY-MM-DD");
  } catch (error) {
    log.i(error);
    return next(new ValidationAppError(error));
  }

  const firstHebergementId =
    declaration.hebergement.hebergements[0].hebergementId;

  const hebergement = await Hebergement.getById(firstHebergementId);
  if (!hebergement) {
    log.w("DONE with error");
    return next(
      new AppError("Hébergement non trouvé", {
        statusCode: 404,
      }),
    );
  }

  const departementSuivi = hebergement.coordonnees.adresse.departement;
  const currentYear = dayjs(declaration.dateDebut).format("YY");
  if (statut == DEMANDE_SEJOUR_STATUTS.BROUILLON) {
    const numSeq = await DemandeSejour.getNextIndex();
    idFonctionnelle = `DS-${currentYear}-${departementSuivi}-${numSeq.padStart(4, "0")}`;
  }

  if (
    statut == DEMANDE_SEJOUR_STATUTS.ATTENTE_8_JOUR ||
    statut == DEMANDE_SEJOUR_STATUTS.A_MODIFIER_8J
  ) {
    log.d("Déclaration à 8 jours");
    try {
      await DemandeSejour.finalize8jours(declarationId, declaration);
    } catch (error) {
      log.w(error);
      if (sentry.enabled) {
        Sentry.captureException(error);
      }
      return next(
        new AppError(
          "Une erreur est survenue de l'enregistrement de la déclaration à 8 jours",
          {
            name: "SaveDeclarationError",
            statusCode: error.statusCode || 500,
          },
        ),
      );
    }
    declaration = await DemandeSejour.getOne({ "ds.id": declarationId });
    try {
      await DemandeSejour.insertEvent(
        "Organisateur",
        declarationId,
        userId,
        null,
        "declaration_sejour",
        "Dépôt DS Complémentaire à 8 jours",
        declaration,
      );
    } catch (error) {
      log.w(error);
      if (sentry.enabled) {
        Sentry.captureException(error);
      }
    }
    try {
      DSuuid = await PdfDeclaration8jours(
        declaration,
        declaration.idFonctionnelle,
        declaration.departementSuivi,
        dateDeposeA2mois,
      );
    } catch (error) {
      log.w(error);
      if (sentry.enabled) {
        Sentry.captureException(error);
      }
    }

    try {
      const destinataires = await DemandeSejour.getEmailToList(
        declaration.organismeId,
      );
      const filteredCc = declaration.organisme.personneMorale.siren
        ? (
            await DemandeSejour.getEmailCcList(
              declaration.organisme.personneMorale.siren,
            )
          ).filter((d) => !destinataires.includes(d))
        : [];

      if (destinataires) {
        await Send(
          MailUtils.usagers.declarationSejour.sendAccuseTransmission8jours({
            cc: filteredCc,
            declaration,
            dest: destinataires,
          }),
        );
      }
    } catch (error) {
      log.w("DONE with error");
      return next(
        new AppError("Une erreur est survenue lors de l'envoi de mails", {
          name: "MailError",
          statusCode: 500,
        }),
      );
    }
    try {
      const destinatairesBack = await DemandeSejour.getEmailBack(
        declaration.departementSuivi,
      );

      if (destinatairesBack) {
        const departements = declaration.hebergement.hebergements.map(
          (h) => h.coordonnees.adresse.departement,
        );
        const destinatairesBackCc =
          await DemandeSejour.getEmailBackCc(departements);

        const filteredBackCc = destinatairesBackCc.filter(
          (d) => !destinatairesBack.includes(d),
        );
        await Send(
          MailUtils.bo.declarationSejour.sendDeclarationA8joursNotify({
            cc: filteredBackCc,
            declaration,
            departementSuivi: declaration.departementSuivi,
            departementsSecondaires: departements.filter(
              (d) => d !== declaration.departementSuivi,
            ),
            destinataires: destinatairesBack,
          }),
        );
      }
    } catch (error) {
      log.w(error);
      return next(
        new AppError(
          "Une erreur est survenue lors de l'envoi de mails aux usagers back office",
          {
            name: "MailError",
            statusCode: 500,
          },
        ),
      );
    }

    log.i("DONE");
    return res.status(200).json({ ARuuid, DSuuid });
  } else {
    log.d("Déclaration à 2 mois");
    try {
      await DemandeSejour.finalize(
        declarationId,
        departementSuivi,
        idFonctionnelle,
        declaration,
      );
    } catch (error) {
      log.w(error);
      if (sentry.enabled) {
        Sentry.captureException(error);
      }
      return next(
        new AppError(
          "Une erreur est survenue de l'enregistrement de la déclaration à 2 mois",
          {
            name: "SaveDeclarationError",
            statusCode: error.statusCode || 500,
          },
        ),
      );
    }

    declaration = await DemandeSejour.getOne({ "ds.id": declarationId });

    try {
      await DemandeSejour.insertEvent(
        "Organisateur",
        declarationId,
        userId,
        null,
        "declaration_sejour",
        statut === DEMANDE_SEJOUR_STATUTS.BROUILLON
          ? "Dépôt DS à 2 mois"
          : "Ajout de compléments",
        declaration,
      );
    } catch (error) {
      log.w(error);
      if (sentry.enabled) {
        Sentry.captureException(error);
      }
    }
    try {
      DSuuid = await PdfDeclaration2Mois(
        declaration,
        idFonctionnelle,
        departementSuivi,
      );
    } catch (error) {
      log.w(error);
      if (sentry.enabled) {
        Sentry.captureException(error);
      }
    }

    try {
      const destinataires = await DemandeSejour.getEmailToList(
        declaration.organismeId,
      );
      const cc = await DemandeSejour.getEmailCcList(
        declaration.organisme.personneMorale.siren ?? "personnePhysique",
      );

      const filteredCc = cc.filter((d) => !destinataires.includes(d));
      if (destinataires) {
        await Send(
          MailUtils.usagers.declarationSejour.sendAccuseTransmission2mois(
            {
              cc: filteredCc,
              declaration,
              dest: destinataires,
            },
            firstSubmit,
          ),
        );
      }
    } catch (error) {
      log.w("DONE with error");
      return next(
        new AppError("Une erreur est survenue lors de l'envoi de mails", {
          name: "MailError",
          statusCode: 500,
        }),
      );
    }
    try {
      const destinatairesBack =
        await DemandeSejour.getEmailBack(departementSuivi);

      if (destinatairesBack) {
        const departements = declaration.hebergement.hebergements.map(
          (h) => h.coordonnees.adresse.departement,
        );
        const destinatairesBackCc =
          await DemandeSejour.getEmailBackCc(departements);

        const filteredBackCc = destinatairesBackCc.filter(
          (d) => !destinatairesBack.includes(d),
        );
        await Send(
          MailUtils.bo.declarationSejour.sendDeclarationNotify({
            cc: filteredBackCc,
            declaration,
            departementSuivi,
            departementsSecondaires: departements.filter(
              (d) => d !== departementSuivi,
            ),
            destinataires: destinatairesBack,
          }),
        );
      }
    } catch (error) {
      log.w(error);
      return next(
        new AppError(
          "Une erreur est survenue lors de l'envoi de mails aux usagers back office",
          {
            name: "SaveDeclarationError",
            statusCode: error.statusCode || 500,
          },
        ),
      );
    }

    log.i("DONE");
    return res.status(200).json({ ARuuid, DSuuid });
  }
};
