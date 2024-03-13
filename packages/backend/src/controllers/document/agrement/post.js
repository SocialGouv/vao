const dayjs = require("dayjs");
const AgrementService = require("../../../services/Agrement");

const logger = require("../../../utils/logger");
// const AppError = require("../../utils/error");

const log = logger(module.filename);

module.exports = async (req, res) => {
  log.i("In");
  const { options } = req.body;
  if (!req.body.options) {
    log.w("missing parameter");
    return res.status(400).json({ msg: "paramètre d'appels incorrects" });
  }
  const { regionDelivrance, numeroAgrement, dateDelivrance, organismeId } =
    JSON.parse(options);
  if (!regionDelivrance || !numeroAgrement || !dateDelivrance || !organismeId) {
    log.w("options parameter is incorrect");
    return res.status(400).json({ msg: "paramètre options incorrect" });
  }
  const dateFinValidite = dayjs(dateDelivrance)
    .add(5, "year")
    .format("YYYY-MM-DD");
  try {
    if (req.file) {
      // suppression logique des anciens agrements
      const nbDeletedAgrement =
        await AgrementService.deleteByOrganismeId(organismeId);
      log.i(nbDeletedAgrement, "old agrements have been deleted");
      const uuid = await AgrementService.uploadFile(req.file);
      if (!uuid) {
        log.w("error while saving file");
        res
          .status(400)
          .json({ message: "Erreur lors de la dépose de l'agrément" });
      }
      log.d("Add document - DONE", uuid);
      const newUuid = await AgrementService.create(
        uuid,
        req.file.originalname,
        organismeId,
        regionDelivrance,
        numeroAgrement,
        dateDelivrance,
        dateFinValidite,
      );
      if (newUuid !== uuid) {
        log.w("error while saving agrement meta values");
        return res
          .status(400)
          .json({ message: "Erreur lors de la dépose de l'agrément" });
      }
      log.d("Add meta values - DONE", uuid);
      return res.json({ document: uuid });
    }
    const agrementId = await AgrementService.getByOrganismeId(organismeId);
    if (agrementId) {
      const updatedAgrementId = await AgrementService.updateOptions(
        organismeId,
        numeroAgrement,
        regionDelivrance,
        dateDelivrance,
        dateFinValidite,
      );
      log.d("updated meta values - DONE", updatedAgrementId);
      return res.json({ updatedAgrementId });
    }
    return res.json({ updatedAgrementId: null });
  } catch (err) {
    log.w(err);
    return res
      .status(400)
      .json({ msg: "Erreur lors de la dépose de l'agrément" });
  }
};
