import { OrganismeAdminRoutes } from "@vao/shared-bridge";
import type { NextFunction } from "express";

import Organisme from "../../services/Organisme";
import type { RouteRequest, RouteResponse } from "../../types/request";
import { logger } from "../../utils/logger";

const log = logger(module.filename);

export default async function get(
  req: RouteRequest<OrganismeAdminRoutes["GetList"]>,
  res: RouteResponse<OrganismeAdminRoutes["GetList"]>,
  next: NextFunction,
) {
  log.i("IN");
  try {
    const query = req.validatedQuery ?? {};
    const organismes = await Organisme.getListe(query);
    return res.status(200).json(organismes);
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
}
