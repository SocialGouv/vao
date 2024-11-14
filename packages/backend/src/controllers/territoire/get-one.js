const AppError = require("../../utils/error");
const Territoire = require("../../services/Territoire");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function getOne(req, res, next) {
  log.i("IN");
  const { idTerritoire } = req.params;

  if (!idTerritoire || isNaN(idTerritoire)) {
    return next(
      new AppError("Paramètre manquant id", {
        statusCode: 400,
      }),
    );
  }
  const territoire = await Territoire.readOne(idTerritoire);
  if (!territoire) {
    log.w("DONE with error");
    return next(
      new AppError("Territoire non trouvée", {
        statusCode: 404,
      }),
    );
  }
  log.i("DONE");
  return res.json({ territoire });
};
