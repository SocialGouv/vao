const logger = require("../utils/logger");
const AppError = require("../utils/error");
const Organisme = require("../services/Organisme");
const Hebergement = require("../services/hebergement/Hebergement");

const log = logger(module.filename);

async function checkPermissionHebergement(req, res, next) {
  const { id: userId } = req.decoded;
  const { id: hebergementId } = req.params;
  log.i("IN");

  if (!hebergementId) {
    return next(
      new AppError("Vous n'êtes pas autorisé à accéder à cet hébergement", {
        statusCode: 403,
      }),
    );
  }

  const organisme = await Organisme.getOne({
    use_id: userId,
  });

  const siren =
    organisme.typeOrganisme === "personne_morale" &&
    organisme.personneMorale?.porteurAgrement === true
      ? organisme.personneMorale?.siren
      : "";

  const hebergements = await Hebergement.getByIdAndMySiren(
    hebergementId,
    userId,
    siren,
  );
  if (!hebergements || hebergements.length !== 1) {
    return next(
      new AppError("Vous n'êtes pas autorisé à accéder à cet hébergement", {
        statusCode: 403,
      }),
    );
  }
  log.i("DONE");
  next();
}

module.exports = checkPermissionHebergement;
