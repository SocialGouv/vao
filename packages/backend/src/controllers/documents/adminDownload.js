const stream = require("stream");
const DocumentService = require("../../services/Document");
const AppError = require("../../utils/error");
const logger = require("../../utils/logger");
const { decodeFilename } = require("../../utils/file");

const log = logger(module.filename);

module.exports = async (req, res, next) => {
  const { uuid } = req.params;
  if (!uuid) {
    return next(new AppError("fichier introuvable", { statusCode: 404 }));
  }
  log.i("IN", { uuid });
  try {
    const file = await DocumentService.getFile(uuid);
    if (!file) {
      return next(new AppError("fichier introuvable", { statusCode: 404 }));
    }
    const readStream = new stream.PassThrough();
    readStream.end(file.file);
    readStream.end(file.file);
    const filename = decodeFilename(file.filename);
    res.set("Content-disposition", `attachment; filename=${filename}`);
    res.set("Content-Type", "text/plain");
    readStream.pipe(res);
    log.i("DONE");
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
