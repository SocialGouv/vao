import type { AgrementsDto, AgrementUsagersRoutes } from "@vao/shared-bridge";
import type { NextFunction, Response } from "express";

import type {
  RouteRequest,
  RouteResponse,
  UserRequest,
} from "../../types/request";
import AppError from "../../utils/error";
import logger from "../../utils/logger";
import { AgrementService } from "./agrements.service";

const log = logger(module.filename);

export const AgrementController = {
  async get(
    req: RouteRequest<AgrementUsagersRoutes["GetOne"]>,
    res: RouteResponse<AgrementUsagersRoutes["GetOne"]>,
    next: NextFunction,
  ) {
    log.i("IN");
    const organismeId = req.validatedParams!.id;

    try {
      const agrement: AgrementsDto | null = await AgrementService.getAgrement({
        organismeId: Number(organismeId),
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
    console.log("agrement", req.body);
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
