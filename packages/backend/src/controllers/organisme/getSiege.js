const Organisme = require("../../services/Organisme");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function get(req, res) {
  log.i("In");
  const { siren } = req.params;
  if (!siren) {
    log.w("missing or invalid parameter");
    return res.status(400).json({ message: "paramètre manquant ou erroné." });
  }
  try {
    const organisme = await Organisme.getSiege(siren);
    log.d(organisme);
    return res.status(200).json({ organisme });
  } catch (error) {
    log.w(error);
    return res.status(400).json({
      message: "une erreur est survenue durant la récupération de l'organisme",
    });
  }
};
