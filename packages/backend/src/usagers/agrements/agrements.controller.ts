import type { AgrementDto, AgrementUsagersRoutes } from "@vao/shared-bridge";
import { AGREMENT_HISTORY_TYPE } from "@vao/shared-bridge";
import type { NextFunction } from "express";

import type { RouteRequest, RouteResponse } from "../../types/request";
import AppError from "../../utils/error";
import logger from "../../utils/logger";
import { AgrementService } from "./agrements.service";

const log = logger(module.filename);

export const AgrementController = {
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
  async getList(
    req: RouteRequest<AgrementUsagersRoutes["GetList"]>,
    res: RouteResponse<AgrementUsagersRoutes["GetList"]>,
    next: NextFunction,
  ) {
    log.i("IN");
    const { id: usagerUserId } = req.decoded!;
    const statut = req.validatedQuery?.statut ?? null;
    try {
      const agrements: AgrementDto[] | [] = await AgrementService.getList({
        statut,
        userId: Number(usagerUserId),
      });
      log.d(agrements);
      if (!agrements.length)
        throw new AppError("NotFound", { statusCode: 404 });
      res.json({ agrements });
    } catch (error) {
      log.w("DONE with error");
      next(error);
    }
  },
  async getOne(
    req: RouteRequest<AgrementUsagersRoutes["GetOne"]>,
    res: RouteResponse<AgrementUsagersRoutes["GetOne"]>,
    next: NextFunction,
  ) {
    log.i("IN");
    const agrementId = Number(req.validatedParams!.agrementId);
    try {
      const agrement: AgrementDto | null = await AgrementService.get({
        agrementId: Number(agrementId),
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
      await AgrementService.updateStatut({
        agrementId,
        statut,
        usagerUserId,
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
    const { id: usagerUserId } = req.decoded!;
    try {
      const id = await AgrementService.save(agrement);
      log.i("Agrement saved", { id });

      await AgrementService.trackEvent({
        agrementId: id,
        source: "usager",
        type: AGREMENT_HISTORY_TYPE.CREATION,
        usagerUserId: Number(usagerUserId),
      });

      res.json({ id });
    } catch (err) {
      log.w("DONE with error", err);
      next(err);
    }
  },
};
