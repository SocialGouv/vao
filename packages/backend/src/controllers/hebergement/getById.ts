import { HebergementDto } from "@vao/shared-bridge";
import type { NextFunction, Response } from "express";

import Hebergement from "../../services/hebergement/Hebergement";
import type { UserRequest } from "../../types/request";
import AppError from "../../utils/error";
import logger from "../../utils/logger";

const log = logger(module.filename);

export default async function get(
  req: UserRequest,
  res: Response,
  next: NextFunction,
) {
  log.i("IN");
  const hebergementId = req.params.id;
  if (!hebergementId) {
    log.w("missing or invalid parameter");

    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }
  try {
    const hebergement: HebergementDto | null =
      await Hebergement.getById(hebergementId);
    log.d(hebergement);
    res.json({ hebergement });
  } catch (error) {
    log.w("DONE with error");
    next(error);
  }
}
