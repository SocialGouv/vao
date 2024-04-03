const BoUser = require("../../services/BoUser");
// const Session = require("../../services/Session");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function post(req, res) {
  const { id,
    nom,
    prenom,
    roles,
    territoire } = req.body;
  log.i("IN", {  id,
    nom,
    prenom,
    roles,
    territoire });

  if (!id || !nom || !prenom || !roles || !territoire) {
    log.w("missing parameter");
    return res.status(400).json({ message: "paramètre manquant." });
  }
  try {
    //log.i("user.email ::::",user.email);

    const { user } = await BoUser.updateUser({
      id,
      nom,
      prenom,
      roles,
      territoire,
    });

    log.d(user);
    return res.status(200).json({ user });
  } catch (error) {
    log.w(error);
    return res.status(400).json({
      message:
        "une erreur est survenue durant la récupération d'utilisateur' des utilisateurs BO",
    });
  }
};
