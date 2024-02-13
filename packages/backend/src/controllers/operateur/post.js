const Operateur = require("../../services/Operateur");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function post(req, res) {
  log.i("IN", req.body);
  const { decoded, body } = req;
  const userId = decoded.id;
  const { type, parametre } = body;

  if (!type || !parametre) {
    log.w("missing or invalid parameter");
    return res.status(400).json({ message: "paramètre manquant ou erroné." });
  }

  try {
    const operateurId = await Operateur.create(type, parametre);
    if (!operateurId) {
      log.w("error while creating operator");
      return res.status(400).json({
        message: "une erreur est survenue durant l'ajout de l'opérateur",
      });
    }

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
      messagee: "Une erreur est survenue durant l'ajout de l'opérateur",
    });
  }
};
