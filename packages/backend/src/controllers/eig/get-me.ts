import { EigUsagersRoutes } from "@vao/shared-bridge";
import type { NextFunction } from "express";

import type { RouteRequest, RouteResponse } from "../../types/request";

const { logger } = require("../../utils/logger");
const eigService = require("../../services/eig");

const log = logger(module.filename);

export default async function getMe(
  req: RouteRequest<EigUsagersRoutes["Get"]>,
  res: RouteResponse<EigUsagersRoutes["Get"]>,
  next: NextFunction,
) {
  log.i("IN");
  const { id: userId } = req.decoded!;
  log.d("userId", { userId });

  const { limit, offset, sortBy, sortDirection, search } =
    req.validatedQuery ?? {};
  const params = {
    limit,
    offset,
    search: search ?? {},
    sortBy,
    sortDirection,
  };

  try {
    const eig = await eigService.getByUserId(userId, params);
    return res.status(200).json({ eig });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
}
