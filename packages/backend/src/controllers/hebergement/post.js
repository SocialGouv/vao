const Hebergement = require("../../services/Hebergement");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function post(req, res) {
  log.i("IN");
  const { body, decoded } = req;

  const { nom, caracteristiques } = body;
  const userId = decoded.id;

  log.d(userId);
  if (!nom || !caracteristiques) {
    log.w("missing or invalid parameter");
    return res.status(400).json({ message: "paramètre manquant ou erroné." });
  }

  try {
    const id = await Hebergement.create(userId, nom, caracteristiques);
    if (!id) {
      log.w("error while creating hebergement");
      return res.status(400).json({
        message: "une erreur est survenue durant l'ajout de l'hébergement",
      });
    }

    return res.status(200).json({
      id,
      message: "sauvegarde opérateur OK",
    });
  } catch (error) {
    log.w(error);
    return res.status(400).json({
      messagee: "Une erreur est survenue durant l'ajout de l'hébergement",
    });
  }
};
