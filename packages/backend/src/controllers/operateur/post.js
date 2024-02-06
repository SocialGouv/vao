const Operateur = require("../../services/Operateur");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function post(req, res) {
  log.i("IN");
  const { decoded, body } = req;
  const userId = decoded.id;
  const personneMorale = body;

  if (!personneMorale || !personneMorale.siren) {
    log.w("missing or invalid parameter");
    return res.status(400).json({ message: "paramètre manquant ou erroné." });
  }

  try {
    const operateur = await Operateur.getOne({
      "personne_morale->>'siret'": personneMorale.siret,
    });
    if (!operateur || operateur.length === 0) {
      log.d("non existing SIRET, try to create it");
      const operateurId = await Operateur.create(personneMorale);
      if (!operateurId) {
        log.w("error while creating operator");
        return res.status(400).json({
          message: "une erreur est survenue durant l'ajout de l'opérateur",
        });
      }

      log.d("Try to create link between user and operator");
      await Operateur.link(userId, operateurId);
      return res
        .status(200)
        .json({ message: "sauvegarde opérateur OK", operateurId });
    }
    log.d("already existing SIRET, try to link it with user");
    const link = await Operateur.checkLink(userId, operateur.operateurId);
    if (link !== 0) {
      log.w("operateur already exist and is already linked to user");
      return res.status(400).json({
        message: "cet opérateur est déjà rattaché à votre compte !",
      });
    }
    await Operateur.link(userId, operateur.operateurId);
    log.d("Done with controller");
    return res.status(200).json({
      message: "sauvegarde opérateur OK",
      operateurId: operateur.operateurId,
    });
  } catch (error) {
    log.w(error);
    return res.status(400).json({
      messagee: "Une erreur est survenue durant l'ajout de l'opérateur",
    });
  }
};
