const Organisme = require("../../services/Organisme");
const AppError = require("../../utils/error");

const { updateRoles } = require("../../services/FoUser");
const { roles } = require("../../helpers/users");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function post(req, res, next) {
  log.i("IN", req.body);
  const { decoded, body } = req;
  const userId = decoded.id;
  const { type, parametre } = body;
  if (!type || !parametre) {
    log.w("missing or invalid parameter");

    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }

  try {
    let organismeAgree;
    let organismeId;

    if (type === "personne_morale" && !parametre.porteurAgrement) {
      organismeAgree = await Organisme.getBySiret(
        parametre.etablissementPrincipal.siret,
      );
      if (!organismeAgree) {
        log.w("DONE with error");
        throw new AppError("organisme agréé not found", { statusCode: 404 });
      }
    }
    const organisme = await Organisme.getBySiret(parametre.siret);
    organismeId = organisme ? organisme.organismeId : null;
    if (organismeId && type === "personne_physique") {
      log.w("DONE with error - siret déjà existant");
      throw new AppError(
        "Création d'un nouvel organisme pour ce siret personne physique non autorisé",
        {
          statusCode: 403,
        },
      );
    }

    if (!organismeId) {
      log.d("organisme inexistant, à créer");
      organismeId = await Organisme.create(type, parametre, userId);
      // On attribue le droit EIG au premier compte pour un PP ou une PM siegesocial
      if (type === "personne_physique" || parametre?.siegeSocial) {
        await updateRoles(userId, [roles.EIG_ECRITURE]);
      }
      if (
        organismeId &&
        type === "personne_morale" &&
        !parametre.porteurAgrement
      ) {
        await Organisme.update(
          "protocole_transport",
          organismeAgree.protocoleTransport,
          organismeId,
        );
        await Organisme.update(
          "protocole_sanitaire",
          organismeAgree.protocoleSanitaire,
          organismeId,
        );
      }
    } else {
      if (type === "personne_morale") {
        await Organisme.update(type, parametre, organismeId, userId);
      }
    }

    await Organisme.link(userId, organismeId);

    return res
      .status(200)
      .json({ message: "sauvegarde organisme OK", organismeId });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
