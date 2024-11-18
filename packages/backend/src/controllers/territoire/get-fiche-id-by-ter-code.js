const AppError = require("../../utils/error");
const Territoire = require("../../services/Territoire");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function getFicheIdByTerCode(req, res, next) {
  log.i("IN");
  const { territoireCode } = req.params;

  if (!territoireCode) {
    return next(
      new AppError("Paramètre manquant territoireCode", {
        statusCode: 400,
      }),
    );
  }
  const territoire = await Territoire.readFicheIdByTerCode(territoireCode);
  if (!territoire) {
    log.w("DONE with error");
    return next(
      new AppError("Fiche territoire non trouvée", {
        statusCode: 404,
      }),
    );
  }
  log.i("DONE");
  return res.json({ territoire });
};
