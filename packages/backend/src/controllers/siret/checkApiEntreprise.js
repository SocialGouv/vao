const logger = require("../../utils/logger");
const { checkTokenApiEntreprise } = require("../../services/Insee");
const AppError = require("../../utils/error");

const log = logger(module.filename);

module.exports = async function checkApiEntreprise(req, res, next) {
  log.i("IN");
  try {
    await checkTokenApiEntreprise();
  } catch (e) {
    log.w("DONE with error");
    return next(
      new AppError("L'API ne semble pas répondre", {
        cause: e,
        name: "ENTREPRISE_UNAVAILABLE",
        statusCode: 503,
      }),
    );
  }
  log.i("DONE");
  return res.status(200).json({
    message: "L'API Entreprise est disponible",
    success: true,
  });
};
