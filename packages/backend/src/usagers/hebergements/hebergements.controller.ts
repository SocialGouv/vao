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
  async getSite(
    req: RouteRequest<HebergementUsagersRoutes["GetSite"]>,
    res: RouteResponse<HebergementUsagersRoutes["GetSite"]>,
    next: NextFunction,
  ) {
    log.i("getSite - IN");
    const { siteId } = req.validatedParams!;
    const { organismeId } = req.validatedQuery!;

    try {
      const { site, unitesHebergement } = await HebergementService.getSite(
        siteId,
        organismeId,
      );
      log.d("getSite", { site, unitesHebergement });
      res.json({ site, unitesHebergement });
    } catch (error) {
      log.w("getSite - DONE with error");
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
  async patchUniteHebergement(
    req: RouteRequest<HebergementUsagersRoutes["PatchUniteHebergement"]>,
    res: RouteResponse<HebergementUsagersRoutes["PatchUniteHebergement"]>,
    next: NextFunction,
  ) {
    log.i("patchUniteHebergement - IN");
    const { siteId, uniteId } = req.validatedParams!;
    const { organismeId } = req.validatedQuery!;
    const { id: usagerUserId } = req.decoded!;
    const unite = req.validatedBody!;

    try {
      const updated = await HebergementService.updateUniteHebergement(
        siteId,
        Number(uniteId),
        organismeId,
        unite,
        usagerUserId,
      );
      log.d("patchUniteHebergement - updated", updated);
      res.json(updated);
    } catch (error) {
      log.w("patchUniteHebergement - DONE with error");
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
  async postUniteHebergement(
    req: RouteRequest<HebergementUsagersRoutes["PostUniteHebergement"]>,
    res: RouteResponse<HebergementUsagersRoutes["PostUniteHebergement"]>,
    next: NextFunction,
  ) {
    log.i("postUniteHebergement - IN");
    const { siteId } = req.validatedParams!;
    const { id: usagerUserId } = req.decoded!;
    const unite = req.validatedBody!;

    try {
      const created = await HebergementService.createUniteHebergement(
        siteId,
        unite,
        usagerUserId,
      );
      log.d("postUniteHebergement - created", created);
      res.status(201).json(created);
    } catch (error) {
      log.w("postUniteHebergement - DONE with error");
      next(error);
    }
  },
};
