import type { HebergementDto, HebergementRoutes } from "@vao/shared-bridge";
import { ERRORS_COMMON } from "@vao/shared-bridge";
import type { RequestHandler } from "express";

import Hebergement from "../../services/hebergement/Hebergement";
import type { RouteRequest, RouteResponse } from "../../types/request";
import logger from "../../utils/logger";

const log = logger(module.filename);

type GetByIdRoute =
  | HebergementRoutes["GetOne"]
  | HebergementRoutes["GetOneAdmin"];

const get: RequestHandler<
  { id: string },
  unknown,
  Record<string, unknown> | undefined,
  Record<string, string> | undefined
> = async (req, res, next) => {
  const typedReq = req as unknown as RouteRequest<GetByIdRoute>;
  const typedRes = res as unknown as RouteResponse<GetByIdRoute>;

  log.i("IN");
  const hebergementId = typedReq.validatedParams?.id ?? typedReq.params.id;

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
    typedRes.json({ hebergement });
  } catch (error) {
    log.w("DONE with error");
    next(error);
  }
};

export default get;
