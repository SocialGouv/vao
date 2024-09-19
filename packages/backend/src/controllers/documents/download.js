const DocumentService = require("../../services/Document");
const AppError = require("../../utils/error");
const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async (req, res, next) => {
  try {
    const { uuid } = req.params;
    log.i("IN", { uuid });
    const data = await DocumentService.download(uuid);
    if (!data) {
      log.w("DONE with error");
      return next(new AppError("fichier introuvable", { statusCode: 404 }));
    }
    const fileStream = data.Body;
    res.set(
      "Content-disposition",
      `attachment; filename=${data.Metadata.originalname || uuid}`,
    );
    res.set("Content-Type", "text/plain");
    fileStream.pipe(res);
    log.i("DONE");
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
