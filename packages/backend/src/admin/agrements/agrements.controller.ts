import type { AgrementAdminRoutes, AgrementDto } from "@vao/shared-bridge";
import type { NextFunction } from "express";

import type { RouteRequest, RouteResponse } from "../../types/request";
import AppError from "../../utils/error";
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
    const regionCode = req.decoded?.territoireCode;
    const search = req.query.search ? JSON.parse(req.query.search) : {};
    try {
      const agrements: AgrementDto[] | null =
        await AgrementService.getListAgrements({
          queryParams: search,
          regionCode: String(regionCode),
        });
      if (!agrements || agrements.length === 0)
        throw new AppError("NotFound", { statusCode: 404 });
      res.json({ agrements });
    } catch (error) {
      log.w("DONE with error");
      next(error);
    }
  },
};
