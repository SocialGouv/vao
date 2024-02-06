const DemandeSejour = require("../../services/DemandeSejour");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function get(req, res) {
  log.i("In");
  const demandeId = req.params.id;
  if (!demandeId) {
    log.w("missing or invalid parameter");
    return res.status(400).json({ message: "paramètre manquant ou erroné." });
  }
  try {
    const demande = await DemandeSejour.getOne({ "ds.id": demandeId });
    log.d(demande);
    return res.status(200).json({ demande });
  } catch (error) {
    log.w(error);
    return res.status(400).json({
      message:
        "une erreur est survenue durant la récupération de la demande de séjour",
    });
  }
};
