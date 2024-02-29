const Hebergement = require("../../services/Hebergement");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function get(req, res) {
  log.i("In");
  const hebergementId = req.params.id;
  if (!hebergementId) {
    log.w("missing or invalid parameter");
    return res.status(400).json({ message: "paramètre manquant ou erroné." });
  }
  try {
    const hebergement = await Hebergement.getOne({ id: hebergementId });
    log.d(hebergement);
    return res.status(200).json({ hebergement });
  } catch (error) {
    log.w(error);
    return res.status(400).json({
      message: "une erreur est survenue durant la récupération de l'opérateur",
    });
  }
};
