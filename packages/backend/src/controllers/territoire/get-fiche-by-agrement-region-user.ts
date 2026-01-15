import type {
  TerritoireDto,
  TerritoireUsagersRoutes,
} from "@vao/shared-bridge";
import type { NextFunction } from "express";

import Organisme from "../../services/Organisme";
import territoireService from "../../services/Territoire";
import type { RouteResponse, UserRequest } from "../../types/request";
import logger from "../../utils/logger";

const log = logger(module.filename);

export default async function get(
  req: UserRequest,
  res: RouteResponse<TerritoireUsagersRoutes["GetByAgrementRegionUser"]>,
  next: NextFunction,
) {
  log.i("IN");
  try {
    const organisme = await Organisme.getOne({
      use_id: req.decoded!.id,
    });

    const result = await territoireService.readFicheIdByTerCode(
      organisme.agrement.regionObtention,
    );

    const ficheTerritoire: TerritoireDto | null =
      await territoireService.readOne(result.id);
    log.d(ficheTerritoire);
    return res.status(200).json({ ficheTerritoire });
  } catch (error) {
    log.w("DONE with error");
    next(error);
  }
}
