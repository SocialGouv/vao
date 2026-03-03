import type { AgrementAdminRoutes } from "@vao/shared-bridge";
import type { NextFunction } from "express";

import type { RouteRequest, RouteResponse } from "../../types/request";
import logger from "../../utils/logger";
import { AgrementService } from "./agrements.service";

const log = logger(module.filename);

export const AgrementController = {
  async getList(
    req: RouteRequest<AgrementAdminRoutes["GetList"]>,
    res: RouteResponse<AgrementAdminRoutes["GetList"]>,
    next: NextFunction,
  ) {
    log.i("IN");
    const regionCode = String(req.decoded?.territoireCode);
    try {
      const { count, result } = await AgrementService.getListAgrements({
        queryParams: req.validatedQuery!,
        regionCode,
      });
      res.json({ agrements: result, count });
    } catch (error) {
      log.w("DONE with error");
      next(error);
    }
  },
  async patchStatut(
    req: RouteRequest<AgrementAdminRoutes["PatchStatut"]>,
    res: RouteResponse<AgrementAdminRoutes["PatchStatut"]>,
    next: NextFunction,
  ) {
    log.i("PATCH statut IN");

    const { id: boUserId } = req.decoded!;
    const agrementId = Number(req.validatedParams!.agrementId);
    const { statut } = req.validatedBody!;
    try {
      await AgrementService.updateStatut({
        agrementId,
        boUserId,
        statut,
      });
      res.json({ success: true });
    } catch (error) {
      log.w("PATCH statut error", error);
      next(error);
    }
  },
};
