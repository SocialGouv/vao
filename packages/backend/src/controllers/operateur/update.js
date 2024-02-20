const Operateur = require("../../services/Operateur");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function post(req, res) {
  log.i("IN", req.body);
  const { body } = req;
  const operateurId = req.params.id;
  const { type, parametre } = body;

  if (!type || !parametre || !operateurId) {
    log.w("missing or invalid parameter");
    return res.status(400).json({ message: "paramètre manquant ou erroné." });
  }
  try {
    const updatedOperateurId = await Operateur.update(
      type,
      parametre,
      operateurId,
    );
    if (!updatedOperateurId || updatedOperateurId !== operateurId) {
      log.w("error while creating operator");
      return res.status(400).json({
        message: "une erreur est survenue durant l'ajout de l'opérateur",
      });
    }
    return res.status(200).json({
      message: "sauvegarde opérateur OK",
      operateurId: updatedOperateurId,
    });
  } catch (error) {
    log.w(error);
    return res.status(400).json({
      messagee: "Une erreur est survenue durant l'ajout de l'opérateur",
    });
  }
};
