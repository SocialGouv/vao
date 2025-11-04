import type { NextFunction, Response } from "express";

import type { UserRequest } from "../../types/request";
import AppError from "../../utils/error";
import logger from "../../utils/logger";
import { AgrementService } from "./agrements.service";

const log = logger(module.filename);

export const AgrementController = {
  async get(req: UserRequest, res: Response, next: NextFunction) {
    log.i("IN");
    const organismeId = Number(req.params.id);

    if (Number.isNaN(organismeId)) {
      log.w("missing or invalid parameter");
      return next(
        new AppError("Paramètre incorrect", {
          statusCode: 400,
        }),
      );
    }

    try {
      const agrement = await AgrementService.getAgrement({
        organismeId,
        withDetails: true,
      });
      log.d(agrement);
      res.json({ agrement });
    } catch (error) {
      log.w("DONE with error");
      next(error);
    }
  },
  async post(req: UserRequest, res: Response, next: NextFunction) {
    log.i("IN");
    if (!req.body) {
      log.w("missing parameter");
      return next(
        new AppError("Paramètre incorrect", {
          statusCode: 400,
        }),
      );
    }
    const { organismeId, numero, regionObtention, dateObtention, file } =
      req.body;

    if (
      !organismeId ||
      !numero ||
      !regionObtention ||
      !dateObtention ||
      !file
    ) {
      log.w("options parameter is incorrect");
      return next(
        new AppError("Paramètre incorrect", {
          statusCode: 400,
        }),
      );
    }

    try {
      const agrementId = await AgrementService.save({
        dateObtention,
        file,
        numero,
        organismeId,
        regionObtention,
      });
      return res.json({ id: agrementId });
    } catch (err) {
      log.w("DONE with error");
      return next(err);
    }
  },
};
