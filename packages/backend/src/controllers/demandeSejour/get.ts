import { SejourUsagersRoutes } from "@vao/shared-bridge";
import type { NextFunction } from "express";

import DemandeSejour from "../../services/DemandeSejour";
import Organisme from "../../services/Organisme";
import type { RouteRequest, RouteResponse } from "../../types/request";
import { logger } from "../../utils/logger";

const log = logger(module.filename);

export default async function get(
  req: RouteRequest<SejourUsagersRoutes["Get"]>,
  res: RouteResponse<SejourUsagersRoutes["Get"]>,
  next: NextFunction,
) {
  log.i("IN");

  const userId = req.decoded?.id;
  log.d("userId", { userId });

  const {
    limit,
    offset,
    sortBy,
    sortDirection,
    departementSuivi,
    idFonctionnelle,
    libelle,
    periode,
    statut,
  } = req.validatedQuery ?? {};
  try {
    const params = {
      departementSuivi,
      idFonctionnelle,
      libelle,
      limit,
      offset,
      periode,
      sortBy,
      sortDirection,
      statut,
    };

    const organisme = await Organisme.getOne({
      use_id: userId,
    });
    let organismesId;
    if (organisme.personneMorale?.porteurAgrement) {
      const organismes = await Organisme.getBySiren(
        organisme.personneMorale.siren,
      );
      organismesId = organismes.map((o) => o.organismeId);
    } else {
      organismesId = [organisme.organismeId];
    }
    const demandes = await DemandeSejour.get(organismesId, params);
    return res.status(200).json({
      demandes: demandes.rows,
      total: demandes.total,
    });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
}
