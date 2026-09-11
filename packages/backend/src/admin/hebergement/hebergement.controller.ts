import type {
  HebergementAdminRoutes,
  HebergementDto,
} from "@vao/shared-bridge";
import type { NextFunction, Response as ExpressResponse } from "express";

import Hebergement from "../../services/hebergement/Hebergement";
import type {
  RouteRequest,
  RouteResponse,
  UserRequest,
} from "../../types/request";
import { escapeCsvField } from "../../utils/csv";
import { logger } from "../../utils/logger";

const log = logger(module.filename);

export const HebergementAdminController = {
  async getExtract(req: UserRequest, res: ExpressResponse, next: NextFunction) {
    log.i("IN");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="data.csv"');
    const departements = req.departements!.map((d) => d.value);
    try {
      const result = await Hebergement.getByDepartementCodes(
        {
          limit: -1,
          order: "ASC",
          search: "",
          sort: "nom",
        },
        departements,
      );

      const titles = [
        { key: "nom", label: "Nom de l'hébergement" },
        { key: "departement", label: "Département" },
        { key: "adresse", label: "Adresse" },
        { key: "telephone", label: "Téléphone" },
        { key: "email", label: "Adresse courriel" },
        { key: "dateVisite", label: "Date de visite préalable" },
        { key: "reglementationErp", label: "Réglementation ERP" },
      ];

      const csv = [
        titles.map(({ label }) => label).join(";"),
        ...result.rows.map((item: Record<string, unknown>) => {
          const newItem = { ...item };
          newItem.reglementationErp = newItem.reglementationErp ? "oui" : "non";
          newItem.dateVisite = newItem.dateVisite
            ? new Date(newItem.dateVisite as string).toLocaleDateString("fr-FR")
            : "";
          return [
            ...titles.map(({ key }) =>
              escapeCsvField((newItem[key] as string) ?? ""),
            ),
          ].join(";");
        }),
      ].join("\n");

      return res.status(200).send(csv);
    } catch (error) {
      log.w("DONE with error");
      next(error);
    }
  },

  async getList(req: UserRequest, res: ExpressResponse, next: NextFunction) {
    const departements = req.departements!.map((d) => d.value);
    try {
      const result = await Hebergement.getByDepartementCodes(
        req.query,
        departements,
      );
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getOne(
    req: RouteRequest<HebergementAdminRoutes["GetOne"]>,
    res: RouteResponse<HebergementAdminRoutes["GetOne"]>,
    next: NextFunction,
  ) {
    const hebergementId = req.validatedParams!.id;
    try {
      const hebergement: HebergementDto | null =
        await Hebergement.getById(hebergementId);
      if (!hebergement) {
        return res.status(404).json({
          hebergement: null,
        });
      }
      log.d("hebergement", hebergement);
      res.json({ hebergement });
    } catch (error) {
      log.w("DONE with error");
      next(error);
    }
  },
};
