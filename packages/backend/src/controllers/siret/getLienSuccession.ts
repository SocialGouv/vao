import type { SiretRoutes, SiretSuccesseurDto } from "@vao/shared-bridge";
import { ERRORS_SIRET } from "@vao/shared-bridge";
import type { NextFunction } from "express";

import { getEtablissementSuccesseur } from "../../services/Insee";
import type { RouteRequest, RouteResponse } from "../../types/request";
import AppError from "../../utils/error";
import logger from "../../utils/logger";

const log = logger(module.filename);

export default async function get(
  req: RouteRequest<SiretRoutes["GetSuccesseur"]>,
  res: RouteResponse<SiretRoutes["GetSuccesseur"]>,
  next: NextFunction,
) {
  const { siret } = req.params;
  log.i("IN", siret);

  try {
    const {
      siretEtablissementSuccesseur,
    }: {
      siretEtablissementSuccesseur: SiretSuccesseurDto | null;
    } = await getEtablissementSuccesseur({
      siret,
    });
    return res.status(200).json({
      siretEtablissementSuccesseur,
    });
  } catch (e) {
    log.w("DONE with error");
    if ((e as any).response.status === 404) {
      return next(
        new AppError("Aucun successeur pour ce numéro de siret", {
          cause: e,
          name: ERRORS_SIRET.EtablissementNoSuccesseur,
          statusCode: 404,
        }),
      );
    } else {
      return next(
        new AppError(
          "Problème lors de la récupération des informations sur l'établissement successeur'",
          {
            cause: e,
            name: ERRORS_SIRET.SiretError,
            statusCode: 404,
          },
        ),
      );
    }
  }
}
