const Hebergement = require("../../services/Hebergement");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function post(req, res) {
  log.i("IN");
  const { body, decoded } = req;

  const { nomHebergement, caracteristiques } = body;
  const userId = decoded.id;

  log.d(userId);
  if (!nomHebergement || !caracteristiques) {
    log.w("missing or invalid parameter");
    return res.status(400).json({ message: "paramètre manquant ou erroné." });
  }

  try {
    const hebergementId = await Hebergement.create(
      userId,
      nomHebergement,
      caracteristiques,
    );
    if (!hebergementId) {
      log.w("error while creating hebergement");
      return res.status(400).json({
        message: "une erreur est survenue durant l'ajout de l'hébergement",
      });
    }

    return res.status(200).json({
      message: "sauvegarde opérateur OK",
      hebergementId,
    });
  } catch (error) {
    log.w(error);
    return res.status(400).json({
      messagee: "Une erreur est survenue durant l'ajout de l'hébergement",
    });
  }
};
