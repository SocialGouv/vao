import {
  type HebergementUsagersRoutes,
  type SiteSimilariteResult,
  FeatureFlagName,
} from "@vao/shared-bridge";
import type { NextFunction } from "express";

import { FeatureFlagService } from "../../services/featureFlagService";
import type { RouteRequest, RouteResponse } from "../../types/request";
import AppError from "../../utils/error";
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
  async getSites(
    req: RouteRequest<HebergementUsagersRoutes["GetSites"]>,
    res: RouteResponse<HebergementUsagersRoutes["GetSites"]>,
    next: NextFunction,
  ) {
    log.i("getSites - IN");

    try {
      const isFeatureEnabled = await FeatureFlagService.isFeatureAvailable(
        FeatureFlagName.MODULE_SITE_UNITE_HEBERGEMENT,
      );
      if (!isFeatureEnabled) {
        log.i("getSites - module désactivé, liste vide");
        res.json({ rows: [], total: 0 });
        return;
      }

      const query = req.validatedQuery ?? {};
      const result = await HebergementService.getSitesList({
        adresse: query.adresse,
        limit: query.limit,
        nom: query.nom,
        offset: query.offset,
        sortBy: query.sortBy,
        sortDirection: query.sortDirection,
        statut: query.statut,
        userId: req.decoded?.id ?? "",
      });
      res.json({ rows: result.rows, total: result.total });
    } catch (error) {
      log.w("getSites - DONE with error", error);
      next(
        new AppError(
          "Une erreur est survenue lors de la récupération des sites",
          { cause: error, statusCode: 500 },
        ),
      );
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
