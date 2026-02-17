const dayjs = require("dayjs");
const AgrementService = require("../../services/Agrement");

const logger = require("../../utils/logger");
const AppError = require("../../utils/error").default;

const log = logger(module.filename);

module.exports = async (req, res, next) => {
  log.i("IN");
  if (!req.body) {
    log.w("missing parameter");
    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }
  const { organismeId, numero, regionObtention, dateObtention, file } =
    req.body;

  if (!organismeId || !numero || !regionObtention || !dateObtention || !file) {
    log.w("options parameter is incorrect");
    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }
  const dateFinValidite = dayjs(dateObtention)
    .add(5, "year")
    .format("YYYY-MM-DD");

  try {
    const agrementId = await AgrementService.getByOrganismeId(organismeId);
    if (agrementId) {
      const updatedAgrementId = await AgrementService.update(
        organismeId,
        numero,
        regionObtention,
        dateObtention,
        dateFinValidite,
        file,
      );
      log.d("updated meta values - DONE", { updatedAgrementId });
      return res.json({ id: updatedAgrementId });
    } else {
      const createdAgrementId = await AgrementService.create(
        organismeId,
        numero,
        regionObtention,
        dateObtention,
        dateFinValidite,
        file,
      );
      log.d("Add meta values - DONE", { createdAgrementId });
      return res.json({ id: createdAgrementId });
    }
  } catch (err) {
    log.w("DONE with error");
    return next(err);
  }
};
