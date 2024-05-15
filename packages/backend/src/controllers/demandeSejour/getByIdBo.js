const DemandeSejour = require("../../services/DemandeSejour");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function getById(req, res, next) {
  log.i("IN");
  const demandeId = req.params.id;

  try {
    const demande = await DemandeSejour.getById(
      demandeId,
      req.departements.map((d) => d.value),
      req.decoded.territoireCode,
    );
    log.d(demande);
    return res.status(200).json({ demande });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
