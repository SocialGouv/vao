const Organisme = require("../../services/Organisme");

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
    let organismeId;
    if (type === "personne_morale") {
      const organisme = await Organisme.getBySiret(parametre.siret);
      organismeId = organisme ? organisme.organismeId : null;
    }
    if (!organismeId) {
      log.d("organisme inexistant, a créer");
      organismeId = await Organisme.create(type, parametre);
    }

    const userLinkedToOrganisme = await Organisme.link(userId, organismeId);
    if (!userLinkedToOrganisme) {
      log.w("error while linking user and organisme");
      return res.status(400).json({
        message:
          "une erreur est survenue durant la création de liaison entre utilisateur et organisme",
      });
    }
    return res
      .status(200)
      .json({ message: "sauvegarde organisme OK", organismeId });
  } catch (error) {
    log.w(error);
    return res.status(400).json({
      messagee: "Une erreur est survenue durant l'ajout de l'organisme",
    });
  }
};
