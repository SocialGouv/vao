const Organisme = require("../../services/Organisme");
const AppError = require("../../utils/error");

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
    let organismeId;
    if (type === "personne_morale") {
      const organisme = await Organisme.getBySiret(parametre.siret);
      organismeId = organisme ? organisme.organismeId : null;
    }
    if (!organismeId) {
      log.d("organisme inexistant, à créer");
      organismeId = await Organisme.create(type, parametre);
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
