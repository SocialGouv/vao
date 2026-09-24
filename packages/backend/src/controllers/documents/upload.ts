import fs from "node:fs/promises";

import { normalizeFilename } from "@vao/shared-bridge";
import type { NextFunction, Response } from "express";

import * as DocumentService from "../../services/Document";
import type { UserRequest } from "../../types/request";
import AppError from "../../utils/error";
import { getFileTypeFromBuffer } from "../../utils/file";
import { logger } from "../../utils/logger";
import { sanitizePdf } from "../../utils/sanitizePdf";

const log = logger(module.filename);

export default async function upload(
  req: UserRequest,
  res: Response,
  next: NextFunction,
) {
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
    const { path, originalname } = file;
    const filename = normalizeFilename(originalname);
    let fileBuffer = await fs.readFile(path);
    const fileType = await getFileTypeFromBuffer(fileBuffer);

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

    if (fileExtension === "pdf") {
      try {
        fileBuffer = await sanitizePdf(fileBuffer);
      } catch (err) {
        log.w("DONE with error: PDF sanitization failed");
        return next(
          new AppError("Impossible de sécuriser le fichier PDF.", {
            cause: err,
            name: "PDFSanitizeError",
            statusCode: 415,
          }),
        );
      }
    }

    const uuid = await DocumentService.createFile(
      filename,
      category,
      detectedMimeType,
      fileBuffer,
      !decoded!.territoireCode ? decoded!.id : null,
    );

    log.d("DONE", uuid);
    return res.json({ uuid });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
}
