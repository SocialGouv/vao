const fs = require("node:fs/promises");
const DocumentService = require("../../services/Document");
const AppError = require("../../utils/error");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async (req, res, next) => {
  log.i("IN");
  const { category } = req.body;
  const { decoded, file } = req;

  if (!category || !file) {
    log.w("DONE with error");
    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }

  try {
    const { path, originalname: filename } = file;
    const fileBuffer = await fs.readFile(path);
    const fileTypeLib = await import("file-type");
    const fileType = await fileTypeLib.fileTypeFromBuffer(fileBuffer);

    if (!fileType) {
      log.w("DONE with error: Impossible de déterminer le type de fichier");
      return next(
        new AppError("Impossible de déterminer le type de fichier.", {
          statusCode: 415,
        }),
      );
    }

    const { ext: fileExtension, mime: detectedMimeType } = fileType;

    if (!["jpg", "jpeg", "png", "pdf"].includes(fileExtension)) {
      log.w("DONE with error fileExtension: ", fileExtension);
      return next(
        new AppError("Extension de fichier non supportée.", {
          statusCode: 415,
        }),
      );
    }

    if (
      category === "agrement" &&
      (detectedMimeType !== "application/pdf" || fileExtension !== "pdf")
    ) {
      log.w("DONE with error");
      return next(
        new AppError("Format d'agrément incorrect.", {
          statusCode: 415,
        }),
      );
    }

    if (
      !["application/pdf", "image/png", "image/jpeg"].includes(detectedMimeType)
    ) {
      log.w("DONE with error filetype: ", detectedMimeType);
      return next(
        new AppError("Format de fichier non supporté.", {
          statusCode: 415,
        }),
      );
    }

    const uuid = await DocumentService.createFile(
      filename,
      category,
      detectedMimeType,
      fileBuffer,
      decoded.id,
    );

    log.d("DONE", uuid);
    return res.json({ uuid });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
