const stream = require("stream");
const DocumentService = require("../../services/Document");
const AppError = require("../../utils/error");
const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async (req, res, next) => {
  try {
    const { uuid } = req.params;
    log.i("IN", { uuid });
    const file = await DocumentService.getFile(uuid);
    if (!file) {
      log.w("DONE with error");
      return next(new AppError("fichier introuvable", { statusCode: 404 }));
    }
    const readStream = new stream.PassThrough();
    readStream.end(file.file);
    res.set("Content-disposition", `attachment; filename=${file.filename}`);
    res.set("Content-Type", "text/plain");
    readStream.pipe(res);
    log.i("DONE");
  } catch (error) {
    log.w("DONE with error");
  }
};

// // next s3 migration step: reading file from S3
// module.exports = async (req, res, next) => {
//   try {
//     const { uuid } = req.params;
//     log.i("IN", { uuid });
//     const file = await DocumentService.getFile(uuid);
//     if (!file) {
//       const data = await DocumentService.download(uuid);
//       if (!data) {
//         log.w("DONE with error");
//         return next(new AppError("fichier introuvable", { statusCode: 404 }));
//       }
//       const readStream = new stream.PassThrough();
//       readStream.end(file.file);
//       res.set("Content-disposition", `attachment; filename=${file.filename}`);
//       const fileStream = data.Body;
//       res.set(
//         "Content-disposition",
//         `attachment; filename=${data.Metadata.originalname || uuid}`,
//       );
//       res.set("Content-Type", "text/plain");
//       readStream.pipe(res);
//       fileStream.pipe(res);
//       log.i("DONE");
//     }
//   } catch (error) {
//     log.w("DONE with error");
//     return next(error);
//   }
// };
