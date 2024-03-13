const Organisme = require("../../services/Organisme");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function get(req, res) {
  log.i("In");
  const { decoded } = req;
  const { id: userId } = decoded;
  try {
    const organisme = await Organisme.get({
      use_id: userId,
    });
    return res.status(200).json({ organisme });
  } catch (error) {
    log.w(error);
    return res.status(400).json({
      message: "une erreur est survenue durant la récupération de l'organisme",
    });
  }
};
