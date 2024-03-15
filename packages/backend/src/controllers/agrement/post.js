const dayjs = require("dayjs");
const AgrementService = require("../../services/Agrement");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async (req, res) => {
  log.i("In");
  if (!req.body) {
    log.w("missing parameter");
    return res.status(400).json({ msg: "paramètre incorrects" });
  }
  const { organismeId, numero, regionObtention, dateObtention, file } =
    req.body;

  if (!organismeId || !numero || !regionObtention || !dateObtention || !file) {
    log.w("options parameter is incorrect");
    return res.status(400).json({ msg: "paramètre incorrect" });
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
    log.w(err);
    return res
      .status(400)
      .json({ msg: "Erreur lors de la dépose de l'agrément" });
  }
};
