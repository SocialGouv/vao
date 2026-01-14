import type { HebergementDto, HebergementRoutes } from "@vao/shared-bridge";
import { ERRORS_COMMON } from "@vao/shared-bridge";
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
    if (!hebergement) {
      return res.status(404).json({
        message: "hebergement not found",
        name: ERRORS_COMMON.NOT_FOUND,
      } as any);
    }
    log.d(hebergement);
    res.json({ hebergement });
  } catch (error) {
    log.w("DONE with error");
    next(error);
  }
}
