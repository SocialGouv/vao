import type {
  OrganismeDto,
  TerritoireDto,
  TerritoireUsagersRoutes,
} from "@vao/shared-bridge";
import type { NextFunction } from "express";

import OrganismeService from "../../services/Organisme";
import TerritoireService from "../../services/Territoire";
import type { RouteRequest, RouteResponse } from "../../types/request";
import AppError from "../../utils/error";
import logger from "../../utils/logger";

const log = logger(module.filename);

export default async function get(
  req: RouteRequest<TerritoireUsagersRoutes["GetByAgrementRegionUser"]>,
  res: RouteResponse<TerritoireUsagersRoutes["GetByAgrementRegionUser"]>,

  next: NextFunction,
) {
  log.i("IN");
  console.log("getFicheByAgrementRegionUser - IN", { userId: req.decoded!.id });
  try {
    const organisme: OrganismeDto | null = await OrganismeService.getOne({
      use_id: req.decoded!.id,
    });
    if (!organisme) {
      return next(
        new AppError("Paramètre manquant territoireCode", {
          statusCode: 404,
        }),
      );
    }
    console.log("Organisme récupéré :", organisme);
    if (!organisme.agrement?.regionObtention) {
      return next(
        new AppError(
          "Erreur lors de la récupération de la région d'obtention de l'agrément",
          {
            statusCode: 400,
          },
        ),
      );
    }

    const result: TerritoireDto = await TerritoireService.readFicheIdByTerCode(
      organisme.agrement.regionObtention,
    );

    const ficheTerritoire: TerritoireDto | null =
      await TerritoireService.readOne(result.id);
    log.d(ficheTerritoire);
    return res.status(200).json({ territoire: ficheTerritoire });
  } catch (error) {
    log.w("DONE with error");
    next(error);
  }
}
