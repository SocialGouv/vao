const Organisme = require("../../services/Organisme");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function post(req, res) {
  log.i("IN", req.body);
  const { body } = req;
  const organismeId = req.params.id;
  const { type, parametre } = body;

  if (!type || !parametre || !organismeId) {
    log.w("missing or invalid parameter");
    return res.status(400).json({ message: "paramètre manquant ou erroné." });
  }
  try {
    const updatedOrganismeId = await Organisme.update(
      type,
      parametre,
      organismeId,
    );
    if (!updatedOrganismeId || updatedOrganismeId !== organismeId) {
      log.w("error while creating organisme");
      return res.status(400).json({
        message: "une erreur est survenue durant l'ajout de l'organisme",
      });
    }
    return res.status(200).json({
      message: "sauvegarde organisme OK",
      organismeId: updatedOrganismeId,
    });
  } catch (error) {
    log.w(error);
    return res.status(400).json({
      messagee: "Une erreur est survenue durant l'ajout de l'organisme",
    });
  }
};
