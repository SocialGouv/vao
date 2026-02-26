import type { AgrementDto, AgrementUsagersRoutes } from "@vao/shared-bridge";
import type { NextFunction } from "express";

import type { RouteRequest, RouteResponse } from "../../types/request";
import AppError from "../../utils/error";
import logger from "../../utils/logger";
import { AgrementService } from "./agrements.service";

const log = logger(module.filename);

export const AgrementController = {
  async get(
    req: RouteRequest<AgrementUsagersRoutes["GetOne"]>,
    res: RouteResponse<AgrementUsagersRoutes["GetOne"]>,
    next: NextFunction,
  ) {
    log.i("IN");
    const organismeId = req.validatedParams!.organismeId;

    try {
      const agrement: AgrementDto | null = await AgrementService.getAgrement({
        organismeId: Number(organismeId),
        withDetails: true,
      });
      log.d(agrement);
      if (!agrement) throw new AppError("NotFound", { statusCode: 404 });
      res.json({ agrement });
    } catch (error) {
      log.w("DONE with error");
      next(error);
    }
  },
  async getAllActivites(
    req: RouteRequest<AgrementUsagersRoutes["GetAllActivites"]>,
    res: RouteResponse<AgrementUsagersRoutes["GetAllActivites"]>,
    next: NextFunction,
  ) {
    try {
      const activites = await AgrementService.getAllActivites();
      res.status(200).json(activites);
    } catch (error) {
      next(error);
    }
  },
  async getHistory(
    req: RouteRequest<AgrementUsagersRoutes["GetHistory"]>,
    res: RouteResponse<AgrementUsagersRoutes["GetHistory"]>,
    next: NextFunction,
  ) {
    try {
      const history = await AgrementService.getHistory(
        Number(req.validatedParams!.agrementId),
      );
      res.status(200).json({ history });
    } catch (error) {
      next(error);
    }
  },
  async patchStatut(
    req: RouteRequest<AgrementUsagersRoutes["PatchStatut"]>,
    res: RouteResponse<AgrementUsagersRoutes["PatchStatut"]>,
    next: NextFunction,
  ) {
    log.i("PATCH statut IN");

    const { id: usagerUserId } = req.decoded!;
    const agrementId = Number(req.validatedParams!.agrementId);
    const { statut } = req.validatedBody!;
    try {
      const success = await AgrementService.updateStatut({
        agrementId,
        statut,
        usagerUserId,
      });
      if (!success)
        throw new AppError("Agrement not found or update failed", {
          statusCode: 404,
        });
      res.json({ success: true });
    } catch (error) {
      log.w("PATCH statut error", error);
      next(error);
    }
  },
  async post(
    req: RouteRequest<AgrementUsagersRoutes["PostAgrement"]>,
    res: RouteResponse<AgrementUsagersRoutes["PostAgrement"]>,
    next: NextFunction,
  ) {
    log.i("IN");
    const agrement = req.validatedBody!;
    try {
      const id = await AgrementService.save(agrement);
      log.i("Agrement saved", { id });

      // todo: supprimer/adapter cet exemple de tracking
      // await AgrementService.trackEvent({
      //   agrementId: id,
      //   boUserId: null,
      //   metadata: null,
      //   source: "Organisateur",
      //   type: AGREMENT_HISTORY_TYPE.CREATION,
      //   typePrecision: "Renuvellement en cours de complétion",
      //   usagerUserId: 1,
      // });

      res.json({ id });
    } catch (err) {
      log.w("DONE with error", err);
      next(err);
    }
  },
};
