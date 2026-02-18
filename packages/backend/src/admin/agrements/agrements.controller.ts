import type {
  AgrementAdminRoutes,
  AgrementDto,
  OrganismeDto,
} from "@vao/shared-bridge";
import type { NextFunction } from "express";

import type { RouteRequest, RouteResponse } from "../../types/request";
import logger from "../../utils/logger";
import type { QueryParamsSearch } from "./agrements.queryUtils";
import { parseQueryParams } from "./agrements.queryUtils";
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
    const search = parseQueryParams(req.query as Record<string, string>);
    try {
      const {
        count,
        result,
      }: {
        count: number;
        result: (AgrementDto & { organisme: OrganismeDto })[];
      } = await AgrementService.getListAgrements({
        queryParams: search as QueryParamsSearch,
        regionCode: String(regionCode),
      });
      res.json({ agrements: result, count });
    } catch (error) {
      log.w("DONE with error");
      next(error);
    }
  },
};
