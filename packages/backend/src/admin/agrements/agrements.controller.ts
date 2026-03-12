import {
  type AgrementAdminRoutes,
  type AgrementDto,
  FunctionalException,
  translate,
} from "@vao/shared-bridge";
import type { NextFunction } from "express";

import type { RouteRequest, RouteResponse } from "../../types/request";
import AppError from "../../utils/error";
import logger from "../../utils/logger";
import { AgrementService } from "./agrements.service";

const log = logger(module.filename);

export const AgrementController = {
  async getHistory(
    req: RouteRequest<AgrementAdminRoutes["GetHistory"]>,
    res: RouteResponse<AgrementAdminRoutes["GetHistory"]>,
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
    req: RouteRequest<AgrementAdminRoutes["GetList"]>,
    res: RouteResponse<AgrementAdminRoutes["GetList"]>,
    next: NextFunction,
  ) {
    log.i("IN");
    const regionCode = String(req.decoded?.territoireCode);
    try {
      const { count, result } = await AgrementService.getListAgrements({
        queryParams: req.validatedQuery!,
        regionCode,
      });
      res.json({ agrements: result, count });
    } catch (error) {
      log.w("DONE with error");
      next(error);
    }
  },
  async getOne(
    req: RouteRequest<AgrementAdminRoutes["GetOne"]>,
    res: RouteResponse<AgrementAdminRoutes["GetOne"]>,
    next: NextFunction,
  ) {
    const agrementId = Number(req.validatedParams!.agrementId);
    try {
      const agrement: AgrementDto | null = await AgrementService.getById({
        agrementId,
        withDetails: true,
      });
      if (!agrement) throw new AppError("NotFound", { statusCode: 404 });
      res.json({ agrement });
    } catch (error) {
      next(error);
    }
  },
  async patchStatut(
    req: RouteRequest<AgrementAdminRoutes["PatchStatut"]>,
    res: RouteResponse<AgrementAdminRoutes["PatchStatut"]>,
    next: NextFunction,
  ) {
    log.i("PATCH statut IN");

    const { id: boUserId, territoireCode } = req.decoded!;
    const agrementId = Number(req.validatedParams!.agrementId);
    const { statut, commentaire, file } = req.validatedBody!;
    try {
      await AgrementService.updateStatut({
        agrementId,
        boUserId,
        commentaire,
        file,
        statut,
        territoireCode,
      });
      res.json({ success: true });
    } catch (error) {
      if (error instanceof FunctionalException) {
        return next(
          new AppError(translate(error.code), {
            cause: error,
            name: error.code,
            statusCode: 422,
          }),
        );
      }
      log.w("PATCH statut error", error);
      next(error);
    }
  },
  async postMessage(
    req: RouteRequest<AgrementAdminRoutes["PostMessage"]>,
    res: RouteResponse<AgrementAdminRoutes["PostMessage"]>,
    next: NextFunction,
  ) {
    const agrementId = Number(req.validatedParams!.agrementId);
    const { message } = req.validatedBody!;
    const { id: backUserId } = req.decoded!;

    try {
      await AgrementService.postMessage({
        agrementId,
        backUserId: Number(backUserId),
        message,
      });
      res.status(201).json({ success: true });
    } catch (error) {
      log.w("erreur POST message", error);
      next(error);
    }
  },
};
