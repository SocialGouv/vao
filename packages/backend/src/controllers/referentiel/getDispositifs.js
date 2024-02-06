const referentielService = require("../../services/referentiel");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async (req, res) => {
  log.i("In");
  try {
    const dispositifs = await referentielService.getAllDispositifs();
    log.d("Done", { dispositifs });
    return res.status(200).json({ dispositifs });
  } catch (err) {
    log.w(err);
    return res
      .status(400)
      .json({ message: "erreur sur la récupération des dispositifs" });
  }
};
