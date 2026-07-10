import type {
  TerritoireDto,
  TerritoireUsagersRoutes,
} from "@vao/shared-bridge";
import type { NextFunction } from "express";

import TerritoireService from "../../services/Territoire";
import type { RouteRequest, RouteResponse } from "../../types/request";
import { AgrementService } from "../../usagers/agrements/agrements.service";
import AppError from "../../utils/error";
import { logger } from "../../utils/logger";

const log = logger(module.filename);

export default async function get(
  req: RouteRequest<TerritoireUsagersRoutes["GetByAgrementRegionUser"]>,
  res: RouteResponse<TerritoireUsagersRoutes["GetByAgrementRegionUser"]>,

  next: NextFunction,
) {
  log.i("IN");
  const userId = req.decoded!.id;
  try {
    // On recherche la région dans la liste des agréments quel que soit le statut
    // On modifie la manière de rechercher car dans la cas d'un premier agrément
    // l'organisme n'a pas d'agrément et donc pas de région d'obtention
    const agrements = await AgrementService.getList({
      userId: Number(userId),
    });
    const agrementWithRegion = agrements.filter(
      (agrement) => agrement.regionObtention,
    );
    if (agrementWithRegion.length === 0) {
      return next(
        new AppError(
          "Aucun agrément avec une région d'obtention n'a été trouvé pour cet utilisateur.",
          {
            statusCode: 404,
          },
        ),
      );
    }

    const regionAgrement = agrementWithRegion[0]?.regionObtention;

    const result: TerritoireDto =
      await TerritoireService.readFicheIdByTerCode(regionAgrement);

    const ficheTerritoire: TerritoireDto | null =
      await TerritoireService.readOne(result.id);
    log.d("ficheTerritoire", ficheTerritoire);
    return res.status(200).json({ territoire: ficheTerritoire });
  } catch (error) {
    log.w("DONE with error");
    next(error);
  }
}
