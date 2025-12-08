import { ERRORS_SIRET } from "@vao/shared-bridge";
import type { NextFunction, Response } from "express";

import { getEtablissementSuccesseur } from "../../services/Insee";
import { UserRequest } from "../../types/request";
import AppError from "../../utils/error";
import logger from "../../utils/logger";

const log = logger(module.filename);

export default async function get(
  req: UserRequest,
  res: Response,
  next: NextFunction,
) {
  const { siret } = req.params;
  log.i("IN", siret);
  if (!siret) {
    log.w("Le siret est manquant");

    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }

  try {
    const { data } = await getEtablissementSuccesseur({ siret });
    return res.status(200).json({ data });
  } catch (e) {
    log.w("DONE with error");
    if (e.response.status == 404) {
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
