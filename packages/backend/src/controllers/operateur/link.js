const Operateur = require("../../services/Operateur");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function get(req, res) {
  log.i("In");
  const operateurId = req.params.id;
  const userId = req.decoded.id;
  if (!operateurId || !userId) {
    log.w("missing or invalid parameter");
    return res.status(400).json({ message: "paramètre manquant ou erroné." });
  }
  try {
    const userLinkedToOperateur = await Operateur.link(userId, operateurId);
    if (!userLinkedToOperateur) {
      log.w("error while linking user and operator");
      return res.status(400).json({
        message:
          "une erreur est survenue durant la création de liaison entre utilisateur et opérateur",
      });
    }
    return res
      .status(200)
      .json({ message: "sauvegarde opérateur OK", operateurId });
  } catch (error) {
    log.w(error);
    return res.status(400).json({
      message: "une erreur est survenue durant la récupération de l'opérateur",
    });
  }
};
