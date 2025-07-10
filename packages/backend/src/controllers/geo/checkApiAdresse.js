const logger = require("../../utils/logger");
const { checkApiSearchAdresse } = require("../../services/AdresseApi");
const AppError = require("../../utils/error");

const log = logger(module.filename);

module.exports = async function checkApiAdresse(_req, res, next) {
  log.i("IN");
  try {
    await checkApiSearchAdresse();
  } catch (e) {
    log.w("DONE with error");
    return next(
      new AppError("L'API ne semble pas répondre", {
        cause: e,
        name: "ADRESSE_UNAVAILABLE",
        statusCode: 503,
      }),
    );
  }
  log.i("DONE");
  return res.status(200).json({
    message: "L'API Adresse est disponible",
    success: true,
  });
};
