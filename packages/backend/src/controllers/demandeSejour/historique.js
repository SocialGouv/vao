const declarationSejour = require("../../services/DemandeSejour");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function get(req, res) {
  log.i("In");
  const declarationId = req.params.id;
  if (!declarationId) {
    log.w("missing or invalid parameter");
    return res.status(400).json({ message: "paramètre manquant ou erroné." });
  }
  try {
    const historique = await declarationSejour.historique(declarationId);
    log.d(historique);
    return res.status(200).json({ historique });
  } catch (error) {
    log.w(error);
    return res.status(400).json({
      message:
        "une erreur est survenue durant la récupération de l'historique de la déclaration de séjour",
    });
  }
};
