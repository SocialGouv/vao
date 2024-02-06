const Operateur = require("../../services/Operateur");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function get(req, res) {
  log.i("In");
  const { decoded } = req;
  const { id: userId } = decoded;

  try {
    const operateurs = await Operateur.get(userId);
    log.d(operateurs);
    return res.status(200).json({ operateurs });
  } catch (error) {
    log.w(error);
    return res.status(400).json({
      message: "une erreur est survenue durant la récupération des opérateurs",
    });
  }
};
