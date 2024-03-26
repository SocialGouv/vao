const Organisme = require("../../services/Organisme");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function finalize(req, res, next) {
  const organismeId = req.params.organismeId;
  log.i("IN", { organismeId });

  if (!organismeId) {
    log.w("missing or invalid parameter");
    return res.status(400).json({ message: "paramètre manquant ou erroné." });
  }

  try {
    await Organisme.finalize(organismeId);
    log.i("DONE");
    return res.status(200).json({
      message: "sauvegarde organisme OK",
    });
  } catch (error) {
    return next(error);
  }
};
