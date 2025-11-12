const { number, object } = require("yup");

const DemandeSejour = require("../../services/DemandeSejour");
const AppError = require("../../utils/error");
const { DEMANDE_SEJOUR_STATUTS } = require("@vao/shared-bridge");
const Send = require("../../services/mail").mailService.send;
const MailUtils = require("../../utils/mail");

const logger = require("../../utils/logger");
const ValidationAppError = require("../../utils/validation-error");

const log = logger(module.filename);

module.exports = async function post(req, res, next) {
  let { declarationId } = req.params;
  const { type } = req.body;
  const { id: userId } = req.decoded;
  let { parametre } = req.body;
  log.i("IN", { declarationId, parametre, type });

  if (!type || !parametre) {
    log.w("missing parameter");
    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }
  try {
    declarationId = await number().required().validate(declarationId);
    parametre = await object().json().required().validate(parametre);
  } catch (error) {
    return next(new ValidationAppError(error));
  }
  const declaration = await DemandeSejour.getOne({ "ds.id": declarationId });
  const { informationsVacanciers, informationsPersonnel, statut } = declaration;

  /* ==================================================== */
  /* Mise à jour d'une déclaration 8J validée ou en cours */
  /* ==================================================== */
  if (
    (statut == DEMANDE_SEJOUR_STATUTS.VALIDEE_8J ||
      statut == DEMANDE_SEJOUR_STATUTS.SEJOUR_EN_COURS) &&
    (type === "informationsVacanciers" || type === "informationsPersonnel")
  ) {
    let differences = "";
    let message = "";
    switch (type) {
      case "informationsVacanciers": {
        differences = deepCompare(informationsVacanciers, parametre);
        message = "Mise à jour du nombre de vacanciers";
        break;
      }
      case "informationsPersonnel": {
        log.d("informationsPersonnel", declarationId);
        // On contrôle de ne pas laisser passer les attestations sur l'honneur non coché
        if (
          !(
            parametre.accompagnants?.every(
              (accompagnant) => accompagnant.attestation,
            ) &&
            parametre.encadrants?.every((encadrant) => encadrant.attestation)
          )
        ) {
          return res.status(400).send({
            message: "Le personnel encadrant ou accompagnant est incomplet",
          });
        }
        message = "Mise à jour du personnel";
        differences = deepCompare(informationsPersonnel, parametre);
        break;
      }
      default:
        log.d("wrong type");
        return null;
    }
    try {
      await DemandeSejour.insertEvent(
        "Organisateur",
        declarationId,
        userId,
        null,
        "declaration_sejour",
        message,
        differences,
      );
    } catch (error) {
      log.w(error);
      return next(
        new AppError(
          "Une erreur est survenue lors de l'insertion des traces événement",
          {
            statusCode: 500,
          },
        ),
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
          MailUtils.bo.declarationSejour.sendUpdateValide8jours({
            cc: filteredBackCc,
            dataUpdated: differences,
            declaration,
            departementSuivi: declaration.departementSuivi,
            departementsSecondaires: departements.filter(
              (d) => d !== declaration.departementSuivi,
            ),
            destinataires: destinatairesBack,
            type,
          }),
        );
      }
    } catch (error) {
      log.w(error);
      return next(
        new AppError(
          "Une erreur est survenue lors de l'envoi de mails aux usagers back office",
          {
            statusCode: 500,
          },
        ),
      );
    }
  }

  try {
    const updatedDeclarationId = await DemandeSejour.update(
      type,
      declarationId,
      parametre,
    );

    log.i("DONE");
    return res.status(200).json({ id: updatedDeclarationId });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};

function deepCompare(obj1, obj2) {
  const changes = {};

  function findChanges(o1, o2, path = "") {
    for (const key in o1) {
      const newPath = path ? `${path}.${key}` : key;
      if (
        typeof o1[key] === "object" &&
        o1[key] !== null &&
        typeof o2[key] === "object" &&
        o2[key] !== null
      ) {
        findChanges(o1[key], o2[key], newPath);
      } else if (o1[key] !== o2[key]) {
        changes[newPath] = { apres: o2[key], avant: o1[key] };
      }
    }

    for (const key in o2) {
      const newPath = path ? `${path}.${key}` : key;
      if (!(key in o1)) {
        changes[newPath] = { apres: o2[key], avant: undefined };
      }
    }
  }

  findChanges(obj1, obj2);
  return changes;
}
