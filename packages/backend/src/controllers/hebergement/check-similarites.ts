import type {
  HebergementUsagersRoutes,
  SiteSimilariteResult,
} from "@vao/shared-bridge";
import type { NextFunction } from "express";

import { HebergementServiceShared } from "../../shared/hebergements/hebergements.service";
import type { RouteRequest, RouteResponse } from "../../types/request";
import { logger } from "../../utils/logger";

const log = logger(module.filename);

export default async function checkSimilarites(
  req: RouteRequest<HebergementUsagersRoutes["CheckSimilarites"]>,
  res: RouteResponse<HebergementUsagersRoutes["CheckSimilarites"]>,
  next: NextFunction,
) {
  log.i("IN");

  try {
    const similarites: SiteSimilariteResult[] =
      await HebergementServiceShared.checkSiteSimilarites(req.validatedBody!);
    log.d("similarites", similarites);
    res.json({ similarites });
  } catch (error) {
    log.w("DONE with error");
    next(error);
  }
}
