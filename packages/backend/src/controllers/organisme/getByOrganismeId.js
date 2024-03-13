const Organisme = require("../../services/Organisme");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function get(req, res) {
  log.i("In");
  const organismeId = req.params.id;
  const { decoded } = req;
  const { id: userId } = decoded;
  if (!organismeId) {
    log.w("missing or invalid parameter");
    return res.status(400).json({ message: "paramètre manquant ou erroné." });
  }
  try {
    const organisme = await Organisme.get({
      id: organismeId,
      use_id: userId,
    });
    log.d(organisme);
    return res.status(200).json({ organisme });
  } catch (error) {
    log.w(error);
    return res.status(400).json({
      message: "une erreur est survenue durant la récupération de l'organisme",
    });
  }
};
