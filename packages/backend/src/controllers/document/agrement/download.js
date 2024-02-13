const stream = require("stream");
const AppError = require("../../../utils/error");
const AgrementService = require("../../../services/Agrement");

const logger = require("../../../utils/logger");

const log = logger(module.filename);

module.exports = async (req, res, next) => {
  const { uuid } = req.params;
  log.i("In", { uuid });
  const file = await AgrementService.getByUuid(uuid);
  if (!file) {
    log.w("missing file");
    return next(new AppError("fichier introuvable", { statusCode: 404 }));
  }
  const readStream = new stream.PassThrough();
  readStream.end(file.file);
  res.set("Content-disposition", `attachment; filename=${file.filename}`);
  res.set("Content-Type", "text/plain");
  log.i("Done");
  readStream.pipe(res);
};
