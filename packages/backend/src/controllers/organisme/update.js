const Organisme = require("../../services/Organisme");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function update(req, res) {
  log.i("IN", req.body);
  const { body } = req;
  const organismeId = req.params.organismeId;
  const { type, parametre } = body;

  if (!type || !parametre || !organismeId) {
    log.w("missing or invalid parameter");
    return res.status(400).json({ message: "paramètre manquant ou erroné." });
  }
  try {
    await Organisme.update(type, parametre, organismeId);
    return res.status(200).json({
      message: "sauvegarde organisme OK",
      organismeId,
    });
  } catch (error) {
    log.w(error);
    return res.status(400).json({
      messagee: "Une erreur est survenue durant l'ajout de l'organisme",
    });
  }
};
