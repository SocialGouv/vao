const Sentry = require("@sentry/node");

const { sentry } = require("../../config");
const fs = require("node:fs/promises");
const { PDFDocument } = require("pdf-lib");
const DocumentService = require("../../services/Document");
const AppError = require("../../utils/error").default;

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
          name: "FileTypeError",
          statusCode: 415,
        }),
      );
    }

    const { ext: fileExtension, mime: detectedMimeType } = fileType;

    if (!["jpg", "jpeg", "png", "pdf"].includes(fileExtension)) {
      log.w("DONE with error fileExtension: ", fileExtension);
      return next(
        new AppError("Extension de fichier non supportée.", {
          name: "FileExtensionError",
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
          name: "FileTypePdfOnlyError",
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
          name: "FileExtensionError",
          statusCode: 415,
        }),
      );
    }
    try {
      const containsJavaScript = await detectJavaScriptInPDF(fileBuffer);
      if (containsJavaScript) {
        log.w("DONE with error: PDF contains JavaScript");
        return next(
          new AppError("Le fichier PDF contient du JavaScript.", {
            name: "FileContainsJavaScriptError",
            statusCode: 415,
          }),
        );
      }
    } catch (err) {
      return next(
        new AppError("Impossible d'analyser le fichier PDF.", {
          cause: err,
          name: "PDFDetectionFailed",
          statusCode: 400,
        }),
      );
    }

    const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
    if (fileBuffer.length > MAX_SIZE_BYTES) {
      return next(
        new AppError(
          "Le fichier dépasse la taille maximale autorisée de 5 Mo.",
          {
            name: "FileIsTooLargeError",
            statusCode: 413,
          },
        ),
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

async function detectJavaScriptInPDF(fileBuffer) {
  log.i("detectJavaScriptInPDF - IN");
  try {
    const pdfDoc = await PDFDocument.load(fileBuffer);

    log.i("detectJavaScriptInPDF - DONE");
    return pdfDoc.context.enumerateIndirectObjects().some(([, obj]) => {
      const str = obj.toString();
      return (
        str.includes("/JavaScript") ||
        str.includes("/JS") ||
        str.includes("/OpenAction") ||
        str.includes("/AA")
      );
    });
  } catch (error) {
    log.w("DONE with error");
    if (sentry.enabled) {
      Sentry.captureException(error);
    }
    throw error;
  }
}
