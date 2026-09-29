import type {
  HebergementUsagersRoutes,
  SiteSimilariteResult,
} from "@vao/shared-bridge";
import type { NextFunction } from "express";

import type { RouteRequest, RouteResponse } from "../../types/request";
import { logger } from "../../utils/logger";
import { HebergementService } from "./hebergements.service";

const log = logger(module.filename);

export const HebergementController = {
  async checkSimilarites(
    req: RouteRequest<HebergementUsagersRoutes["CheckSimilarites"]>,
    res: RouteResponse<HebergementUsagersRoutes["CheckSimilarites"]>,
    next: NextFunction,
  ) {
    log.i("IN");

    try {
      const similarites: SiteSimilariteResult[] =
        await HebergementService.checkSiteSimilarites(req.validatedBody!);
      log.d("similarites", similarites);
      res.json({ similarites });
    } catch (error) {
      log.w("DONE with error");
      next(error);
    }
  },
};
