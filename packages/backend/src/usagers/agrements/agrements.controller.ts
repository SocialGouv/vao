import type { AgrementDto, AgrementUsagersRoutes } from "@vao/shared-bridge";
import type { NextFunction } from "express";

import type { RouteRequest, RouteResponse } from "../../types/request";
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
      const agrement: AgrementDto | null = await AgrementService.getAgrement({
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
  async post(
    req: RouteRequest<AgrementUsagersRoutes["PostAgrement"]>,
    res: RouteResponse<AgrementUsagersRoutes["PostAgrement"]>,
    next: NextFunction,
  ) {
    log.i("IN");
    const agrement = req.validatedBody!;
    try {
      const id = await AgrementService.save(agrement);
      res.json({ id });
    } catch (err) {
      log.w("DONE with error");
      next(err);
    }
  },
};
