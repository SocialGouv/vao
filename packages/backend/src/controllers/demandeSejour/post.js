const yup = require("yup");

const DemandeSejour = require("../../services/DemandeSejour");
const Organisme = require("../../services/Organisme");

const { baseSchema } = require("../../schemas/declaration-sejour");

const AppError = require("../../utils/error");

const logger = require("../../utils/logger");
const ValidationAppError = require("../../utils/validation-error");

const log = logger(module.filename);

module.exports = async function post(req, res, next) {
  const { id: userId } = req.decoded;
  log.i("IN", { body: req.body });
  const { parametre } = req.body;

  let demandeSejour;

  try {
    demandeSejour = await yup.object(baseSchema).validate(parametre, {
      abortEarly: false,
      stripUnknown: true,
    });
  } catch (error) {
    return next(new ValidationAppError(error));
  }

  try {
    const organisme = await Organisme.getOne({ "uo.use_id": userId });
    if (!organisme.complet) {
      log.w("organisme isn't fully filled");
      return next(
        new AppError(
          "Vous devez compléter la fiche organisateur avant de saisir une déclaration de séjour",
          {
            statusCode: 400,
          },
        ),
      );
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

    const demandeId = await DemandeSejour.create({
      ...demandeSejour,
      organisme,
    });

    await DemandeSejour.insertEvent(
      "Organisateur",
      demandeId,
      userId,
      null,
      "declaration_sejour",
      "creation",
      {},
    );
    return res.status(200).json({ id: demandeId });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
