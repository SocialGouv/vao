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

  try {
    const userId = req.decoded?.id;
    log.d("userId", { userId });

    const query = req.validatedQuery ?? {};

    const params = {
      departementSuivi: query.departementSuivi ?? undefined,
      idFonctionnelle: query.idFonctionnelle ?? undefined,
      libelle: query.libelle ?? undefined,
      limit: query.limit,

      offset: query.offset,
      periode: query.periode ?? undefined,
      sortBy: query.sortBy,
      sortDirection: query.sortDirection,
      statut: query.statut ?? undefined,
    };

    const organisme = await Organisme.getOne({
      use_id: userId,
    });

    const organismesId = organisme.personneMorale?.porteurAgrement
      ? (await Organisme.getBySiren(organisme.personneMorale.siren)).map(
          (o) => o.organismeId,
        )
      : [organisme.organismeId];

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
