import type { HebergementDto, HebergementRoutes } from "@vao/shared-bridge";
import type { NextFunction } from "express";

import Hebergement from "../../services/hebergement/Hebergement";
import type { RouteRequest, RouteResponse } from "../../types/request";
import logger from "../../utils/logger";

const log = logger(module.filename);

export default async function get(
  req: RouteRequest<HebergementRoutes["GetOne"]>,
  res: RouteResponse<HebergementRoutes["GetOne"]>,
  next: NextFunction,
) {
  log.i("IN");
  const hebergementId = req.validatedParams!.id;
  try {
    const hebergement: HebergementDto | null =
      await Hebergement.getById(hebergementId);
    log.d(hebergement);
    res.json({ hebergement });
  } catch (error) {
    log.w("DONE with error");
    next(error);
  }
}
