import { EigAdminRoutes } from "@vao/shared-bridge";
import type { NextFunction } from "express";

import eigService from "../../services/eig";
import type { RouteRequest, RouteResponse } from "../../types/request";
import { logger } from "../../utils/logger";

const log = logger(module.filename);

export default async function getAdmin({
  req,
  res,
  next,
}: {
  req: RouteRequest<EigAdminRoutes["Get"]>;
  res: RouteResponse<EigAdminRoutes["Get"]>;
  next: NextFunction;
}) {
  log.i("IN");
  //const { limit, offset, sortBy, sortDirection, search } = req.query;
  const { limit, offset, sortBy, sortDirection, search } =
    req.validatedParams ?? {};
  const params = {
    limit,
    offset,
    search: JSON.parse(search ?? "{}"),
    sortBy,
    sortDirection,
  };

  const { id: userId } = req.decoded!;
  log.d("userId", { userId });
  try {
    const eig = await eigService.getAdmin(params);
    return res.status(200).json({ eig: eig.eigs, total: eig.total });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
}
