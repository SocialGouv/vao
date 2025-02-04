const stream = require("stream");
const DocumentService = require("../../services/Document");
const AppError = require("../../utils/error");
const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async (req, res, next) => {
  const { id: userId } = req.decoded;
  const { uuid } = req.params;
  if (!uuid) {
    return next(new AppError("fichier introuvable", { statusCode: 404 }));
  }
  log.i("IN", { uuid });
  let metaData = null;
  try {
    metaData = await DocumentService.getFileMetaData(uuid);
    if (!metaData || (metaData.userId !== null && metaData.userId !== userId)) {
      return next(new AppError("fichier introuvable", { statusCode: 404 }));
    }
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }

  try {
    const file = await DocumentService.getFile(uuid);
    const readStream = new stream.PassThrough();
    readStream.end(file.file);
    res.set("Content-disposition", `attachment; filename=${file.filename}`);
    res.set("Content-Type", "text/plain");
    readStream.pipe(res);
    // // -- next migration step: read files from S3
    // file.Body.pipe(res);
    log.i("DONE");
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
