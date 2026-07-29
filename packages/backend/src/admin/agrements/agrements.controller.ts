import {
  type AgrementAdminRoutes,
  type AgrementDto,
  FunctionalException,
  translate,
} from "@vao/shared-bridge";
import dayjs from "dayjs";
import type { NextFunction, Response as ExpressResponse } from "express";

import type {
  RouteRequest,
  RouteResponse,
  UserRequest,
} from "../../types/request";
import { escapeCsvField } from "../../utils/csv";
import AppError from "../../utils/error";
import { logger } from "../../utils/logger";
import type { AgrementExtractRow } from "./agrements.repository";
import { AgrementService } from "./agrements.service";

const log = logger(module.filename);

function buildAgrementsCsv(agrements: AgrementExtractRow[]): string {
  const titles = [
    "numero",
    "statut",
    "date_depot",
    "date_obtention",
    "date_fin_validite",
    "region_obtention",
    "organisme",
    "siret",
  ];

  const rows = agrements.map((agrement) => {
    const values: Record<string, string> = {
      date_depot: agrement.dateDepot
        ? dayjs(agrement.dateDepot).format("YYYY-MM-DD")
        : "",
      date_fin_validite: agrement.dateFinValidite
        ? dayjs(agrement.dateFinValidite).format("YYYY-MM-DD")
        : "",
      date_obtention: agrement.dateObtention
        ? dayjs(agrement.dateObtention).format("YYYY-MM-DD")
        : "",
      numero: agrement.numero ?? "",
      organisme: agrement.organismeName ?? "",
      region_obtention: agrement.regionObtention ?? "",
      siret: agrement.organismeSiret ?? "",
      statut: agrement.statut ?? "",
    };

    return titles.map((title) => escapeCsvField(values[title] ?? "")).join(";");
  });

  return [titles.join(";"), ...rows].join("\n");
}

export const AgrementController = {
  async getAllActivites(
    req: UserRequest,
    res: RouteResponse<AgrementAdminRoutes["GetAllActivites"]>,
    next: NextFunction,
  ) {
    try {
      const activites = await AgrementService.getAllActivites();
      res.status(200).json(activites);
    } catch (error) {
      next(error);
    }
  },

  async getExtract(
    req: RouteRequest<AgrementAdminRoutes["GetExtract"]>,
    // Cette route sort un CSV brut (pas du JSON), donc `res` sort volontairement
    // du typage RouteResponse<...> (pensé pour .json()) au profit du type Response
    // brut d'Express, qui autorise .send() avec un body string.
    res: ExpressResponse,
    next: NextFunction,
  ) {
    log.i("IN");
    const regionCode = String(req.decoded?.territoireCode);
    try {
      const agrements = await AgrementService.getExtract(regionCode);
      const csv = buildAgrementsCsv(agrements);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="agrements.csv"',
      );
      res.status(200).send(csv);
    } catch (error) {
      log.w("DONE with error");
      next(error);
    }
  },
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

  async getMessages(
    req: RouteRequest<AgrementAdminRoutes["GetMessages"]>,
    res: RouteResponse<AgrementAdminRoutes["GetMessages"]>,
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
  async patchMessages(
    req: RouteRequest<AgrementAdminRoutes["PatchMessages"]>,
    res: RouteResponse<AgrementAdminRoutes["PatchMessages"]>,
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
    req: RouteRequest<AgrementAdminRoutes["PatchStatut"]>,
    res: RouteResponse<AgrementAdminRoutes["PatchStatut"]>,
    next: NextFunction,
  ) {
    log.i("PATCH statut IN");

    const { id: boUserId, territoireCode } = req.decoded!;
    const agrementId = Number(req.validatedParams!.agrementId);
    const { statut, commentaire, file, numeroAgrement } = req.validatedBody!;
    try {
      await AgrementService.updateStatut({
        agrementId,
        boUserId,
        commentaire,
        file,
        numeroAgrement,
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

    const backUserId = Number(req.decoded!.id);

    try {
      await AgrementService.postMessage({
        agrementId,
        backUserId,
        message,
      });
      res.status(201).json({ success: true });
    } catch (error) {
      log.w("erreur POST message", error);
      next(error);
    }
  },
};
