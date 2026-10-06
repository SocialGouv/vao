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
  async checkTypeHebergement(
    req: RouteRequest<HebergementUsagersRoutes["CheckTypeHebergement"]>,
    res: RouteResponse<HebergementUsagersRoutes["CheckTypeHebergement"]>,
    next: NextFunction,
  ) {
    log.i("IN");

    try {
      const result = await HebergementService.checkTypeHebergement(
        req.validatedBody!,
      );
      log.d("typeVerification", result);
      res.json(result);
    } catch (error) {
      log.w("DONE with error");
      next(error);
    }
  },
  async patchSite(
    req: RouteRequest<HebergementUsagersRoutes["PatchSite"]>,
    res: RouteResponse<HebergementUsagersRoutes["PatchSite"]>,
    next: NextFunction,
  ) {
    log.i("patchSite - IN");
    const { siteId } = req.validatedParams!;
    const site = req.validatedBody!;

    try {
      await HebergementService.updateSiteInformation(siteId, site);
      res.status(200).json({});
    } catch (error) {
      log.w("patchSite - DONE with error");
      next(error);
    }
  },
  async postSite(
    req: RouteRequest<HebergementUsagersRoutes["PostSite"]>,
    res: RouteResponse<HebergementUsagersRoutes["PostSite"]>,
    next: NextFunction,
  ) {
    log.i("postSite - IN");
    const { id: usagerUserId } = req.decoded!;
    const site = req.validatedBody!;

    try {
      const createdSite = await HebergementService.postSite(site, usagerUserId);
      log.d("createdSite", createdSite);
      res.status(201).json(createdSite);
    } catch (error) {
      log.w("postSite - DONE with error");
      next(error);
    }
  },
};
