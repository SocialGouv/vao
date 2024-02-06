const Operateur = require("../../services/Operateur");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function get(req, res) {
  const { decoded } = req;
  const operateurId = req.params?.id;
  log.i("In");

  const { id: userId } = decoded;
  if (operateurId) {
    const operateur = await Operateur.getOne({ id: operateurId });
    return res.status(200).json({ operateur });
  }
  const operateurs = await Operateur.get(userId);
  log.i("Done");
  return res.status(200).json({ operateurs });
};
