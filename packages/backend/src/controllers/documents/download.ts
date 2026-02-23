import { PassThrough } from "node:stream";

import type { NextFunction, Response } from "express";

import * as DocumentService from "../../services/Document";
import type { UserRequest } from "../../types/request";
import AppError from "../../utils/error";
import logger from "../../utils/logger";

const log = logger(module.filename);

export default async function download(
  req: UserRequest,
  res: Response,
  next: NextFunction,
) {
  const { uuid } = req.params;
  log.i("IN", { uuid });
  try {
    const metaData = await DocumentService.getFileMetaData(uuid);
    if (!metaData || metaData.userId == null) {
      next(new AppError("fichier introuvable", { statusCode: 404 }));
      return;
    }

    const file = await DocumentService.getFile(uuid);
    if (!file || file.file?.byteLength === 0) {
      next(new AppError("fichier introuvable", { statusCode: 404 }));
      return;
    }
    const readStream = new PassThrough();
    readStream.end(file.file);
    res.set("Content-disposition", `attachment; filename=${metaData.name}`);
    res.set("Content-Type", file.mimeType ?? "application/octet-stream");
    readStream.pipe(res);
    log.i("DONE", { filename: metaData.name, mimeType: file.mimeType });
  } catch (error: unknown) {
    log.w(
      "DONE with error",
      error instanceof Error ? error.message : String(error),
    );
    next(error);
  }
}
