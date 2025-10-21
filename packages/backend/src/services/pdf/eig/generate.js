const logger = require("../../../utils/logger");
const build = require("./build");
const AppError = require("../../../utils/error");

const log = logger(module.filename);

const generate = async ({ eig, serviceRegional }) => {
  log.i("IN");
  try {
    return await build({
      eig,
      serviceRegional,
    });
  } catch (error) {
    log.w("PDF generation failed", {
      error: error.message,
      stack: error.stack,
    });
    throw new AppError("Erreur lors de la génération du PDF", {
      cause: error,
      name: "pdfError",
      statusCode: 500,
    });
  }
};

module.exports = generate;
