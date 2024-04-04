const BoUser = require("../../services/BoUser");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function update(req, res) {
  const { email, nom, prenom, roles, territoire } = req.body;
  log.i("IN", { email, nom, prenom, roles, territoire });

  if (!email || !nom || !prenom || !roles || !territoire) {
    log.w("missing parameter");
    return res.status(400).json({ message: "paramètre manquant." });
  }
  try {
    await BoUser.create({
      email,
      nom,
      prenom,
      roles,
      territoire,
    });
    return res.status(200).json({ message: "Utilisateur mis à jour" });
  } catch (error) {
    log.w(error);
    return res.status(400).json({
      message:
        "une erreur est survenue durant la récupération d'utilisateur' des utilisateurs BO",
    });
  }
};
