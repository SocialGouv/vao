const DemandeSejour = require("../../services/DemandeSejour");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function post(req, res) {
  const demandeSejourId = req.params.id;
  const { type, parametre } = req.body;
  log.i("IN", { demandeSejourId, parametre, type });

  if (!type || !demandeSejourId || !parametre) {
    log.w("missing parameter");
    return res.status(400).json({ message: "paramètre manquant." });
  }

  try {
    const demandeId = await DemandeSejour.update(
      type,
      demandeSejourId,
      parametre,
    );
    if (!demandeId) {
      log.w("update query returned null, demandeId expected");
      return res.status(400).json({
        message: "une erreur est survenue durant la sauvegarde de la demande",
      });
    }
    return res.status(200).json({ id: demandeId });
  } catch (error) {
    log.w(error);
    return res.status(400).json({
      message: "Une erreur est survenue durant la mise à jour de la demande",
    });
  }
};
