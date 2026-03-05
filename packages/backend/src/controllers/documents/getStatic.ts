import type { NextFunction, Response } from "express";

import * as DocumentService from "../../services/Document";
import type { UserRequest } from "../../types/request";
import logger from "../../utils/logger";

const log = logger(module.filename);

export default async function getStatic(
  req: UserRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { name } = req.params;
    log.i("IN", { name });
    const file = DocumentService.getStaticFile(name, "static");
    res.download(file);
    log.i("DONE");
  } catch (error) {
    log.w("DONE with error");
    next(error);
  }
}
