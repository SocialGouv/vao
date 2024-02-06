const dayjs = require("dayjs");
const DocumentService = require("../../services/Document");
const AgrementService = require("../../services/Agrement");
const OperateurService = require("../../services/Operateur");

const logger = require("../../utils/logger");
// const AppError = require("../../utils/error");

const log = logger(module.filename);

module.exports = async (req, res) => {
  log.i("In");
  const { options } = req.body;
  if (!req.file || !req.body.options) {
    log.w("missing parameter");
    return res.status(400).json({ msg: "paramètre d'appels incorrects" });
  }

  const { regionDelivrance, numeroAgrement, dateDelivrance, operateurId } =
    JSON.parse(options);
  if (!regionDelivrance || !numeroAgrement || !dateDelivrance || !operateurId) {
    log.w("options parameter is incorrect");
    return res.status(400).json({ msg: "paramètre options incorrect" });
  }
  try {
    const uuid = await DocumentService.uploadFile(req.file);
    if (!uuid) {
      log.w("error while saving file");
      res
        .status(400)
        .json({ message: "Erreur lors de la dépose de l'agrément" });
    }
    log.d("Add document - DONE", uuid);
    const dateFinValidite = dayjs(dateDelivrance).add(5, "year");
    const newUuid = await AgrementService.create(
      uuid,
      operateurId,
      regionDelivrance,
      numeroAgrement,
      dateDelivrance,
      dateFinValidite
    );
    if (newUuid !== uuid) {
      log.w("error while saving agrement meta values");
      return res
        .status(400)
        .json({ message: "Erreur lors de la dépose de l'agrément" });
    }
    log.d("Add meta values - DONE", uuid);
    return res.json({ document: uuid });
  } catch (err) {
    log.w(err);
    return res
      .status(400)
      .json({ msg: "Erreur lors de la dépose de l'agrément" });
  }
};
