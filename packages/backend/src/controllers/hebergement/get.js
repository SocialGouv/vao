const Hebergement = require("../../services/Hebergement");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function get(req, res) {
  log.i("In");
  const { decoded } = req;
  const { id: userId } = decoded;

  try {
    const hebergements = await Hebergement.get(userId);
    log.d(hebergements);
    return res.status(200).json({ hebergements });
  } catch (error) {
    log.w(error);
    return res.status(400).json({
      message:
        "une erreur est survenue durant la récupération des hebergements",
    });
  }
};
