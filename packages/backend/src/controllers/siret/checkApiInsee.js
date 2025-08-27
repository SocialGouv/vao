const logger = require("../../utils/logger");
const { getToken } = require("../../services/Insee");
const AppError = require("../../utils/error");

const log = logger(module.filename);

module.exports = async function checkApiInsee(_req, res, next) {
  log.i("IN");
  try {
    const data = await getToken();
    if (data.etatService !== "UP") {
      throw new AppError("Le service INSEE n'est pas UP", {
        details: data,
        name: "INSEE_DOWN",
        statusCode: 503,
      });
    }
  } catch (e) {
    log.w("DONE with error");
    return next(
      new AppError("L'API ne semble pas répondre", {
        cause: e,
        name: "INSEE_UNAVAILABLE",
        statusCode: 503,
      }),
    );
  }
  log.i("DONE");
  return res.status(200).json({
    message: "L'API Insee est disponible",
    success: true,
  });
};
