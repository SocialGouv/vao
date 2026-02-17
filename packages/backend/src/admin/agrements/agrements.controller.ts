import type {
  AgrementAdminRoutes,
  AgrementDto,
  OrganismeDto,
} from "@vao/shared-bridge";
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
    const search = typeof req.query === "string" ? JSON.parse(req.query) : {};
    try {
      const {
        count,
        result,
      }: {
        count: number;
        result: (AgrementDto & { organisme: OrganismeDto })[];
      } = await AgrementService.getListAgrements({
        queryParams: search,
        regionCode: String(regionCode),
      });
      if (!result || result.length === 0)
        throw new AppError("NotFound", { statusCode: 404 });
      res.json({ agrements: result, count });
    } catch (error) {
      log.w("DONE with error");
      next(error);
    }
  },
};
