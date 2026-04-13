import type { AgrementDto, AgrementUsagersRoutes } from "@vao/shared-bridge";
import {
  AGREMENT_HISTORY_TYPE,
  ERRORS_COMMON,
  validateId,
} from "@vao/shared-bridge";
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
      const agrements = await AgrementService.getList({
        statut,
        userId: Number(usagerUserId),
      });
      log.d(agrements);
      res.json({ agrements });
    } catch (error) {
      log.w("DONE with error");
      next(error);
    }
  },
  async getMessages(
    req: RouteRequest<AgrementUsagersRoutes["GetMessages"]>,
    res: RouteResponse<AgrementUsagersRoutes["GetMessages"]>,
    next: NextFunction,
  ) {
    const agrementId = Number(req.validatedParams!.agrementId);
    try {
      const { messages, unreadCount } =
        await AgrementService.getMessages(agrementId);
      res.status(200).json({
        count: messages.length,
        messages,
        unreadCount,
      });
    } catch (error) {
      log.w("Erreur lors de la récupération des messages", error);
      next(error);
    }
  },
  async getOne(
    req: RouteRequest<AgrementUsagersRoutes["GetOne"]>,
    res: RouteResponse<AgrementUsagersRoutes["GetOne"]>,
    next: NextFunction,
  ) {
    log.i("IN");
    const { id: agrementId, error } = validateId(req.params.agrementId);
    if (error || agrementId === undefined) {
      return next(
        new AppError(ERRORS_COMMON.INVALID_PARAMS, { statusCode: 400 }),
      );
    }

    try {
      const agrement: AgrementDto | null = await AgrementService.getById({
        agrementId,
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
  async patchMessages(
    req: RouteRequest<AgrementUsagersRoutes["PatchMessages"]>,
    res: RouteResponse<AgrementUsagersRoutes["PatchMessages"]>,
    next: NextFunction,
  ) {
    const agrementId = Number(req.validatedParams!.agrementId);
    try {
      const count = await AgrementService.markMessagesAsRead(agrementId);
      res.status(200).json({ count });
    } catch (error) {
      log.w("Erreur lors du patch des messages", error);
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
    const { id: agrementId, error } = validateId(req.params.agrementId);
    if (error || agrementId === undefined) {
      return next(
        new AppError(ERRORS_COMMON.INVALID_PARAMS, { statusCode: 400 }),
      );
    }
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
  async postMessage(
    req: RouteRequest<AgrementUsagersRoutes["PostMessage"]>,
    res: RouteResponse<AgrementUsagersRoutes["PostMessage"]>,
    next: NextFunction,
  ) {
    const agrementId = Number(req.validatedParams!.agrementId);
    const { message } = req.validatedBody!;

    const userId = Number(req.decoded!.id);

    try {
      await AgrementService.postMessage({
        agrementId,
        message,
        userId,
      });
      res.status(201).json({ success: true });
    } catch (error) {
      log.w("erreur POST message", error);
      next(error);
    }
  },
};
