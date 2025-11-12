const Eig = require("../../services/eig");
const generatePdfEig = require("../../services/pdf/eig/generate");
const logger = require("../../utils/logger");
const Region = require("../../services/geo/Region");
const AppError = require("../../utils/error");

const log = logger(module.filename);

module.exports = async function getPdf(req, res, next) {
  const { id: eigId } = req.params;
  log.i("IN", { eigId }, req.body);
  if (!eigId) {
    log.w("missing parameter");
    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }
  try {
    const eig = await Eig.getById({ eigId });
    if (!eig) {
      return next(
        new AppError("Eig non trouvé", {
          statusCode: 404,
        }),
      );
    }

    const serviceRegional = await Region.fetchOne(eig.agrementRegionObtention);
    if (!serviceRegional) {
      return next(
        new AppError("Service régional de l'agrément non trouvé", {
          statusCode: 404,
        }),
      );
    }
    const file = await generatePdfEig({
      eig,
      serviceRegional: serviceRegional?.text,
    });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="synthese-eig-${eigId}.pdf"`,
    );
    return res.status(200).send(file);
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
