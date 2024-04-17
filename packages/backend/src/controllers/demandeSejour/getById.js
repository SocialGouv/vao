const DemandeSejour = require("../../services/DemandeSejour");
const AppError = require("../../utils/error");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function get(req, res, next) {
  log.i("IN");
  const demandeId = req.params.id;
  if (!demandeId) {
    log.w("missing or invalid parameter");
    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }
  try {
    const demande = await DemandeSejour.getOne({ "ds.id": demandeId });
    log.d(demande);
    return res.status(200).json({ demande });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
