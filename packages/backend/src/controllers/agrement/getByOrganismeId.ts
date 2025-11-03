import type { NextFunction, Response } from "express";

import getByOrganismeId from "../../services/agrements/Agrements";
import type { UserRequest } from "../../types/request";
import AppError from "../../utils/error";
import logger from "../../utils/logger";

const log = logger(module.filename);

export default async function get(
  req: UserRequest,
  res: Response,
  next: NextFunction,
) {
  log.i("IN");
  const organismeId = Number(req.params.id);

  if (Number.isNaN(organismeId)) {
    log.w("missing or invalid parameter");
    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }

  try {
    const { agrement } = await getByOrganismeId({
      organismeId,
    });
    log.d(agrement);
    res.json({ agrement });
  } catch (error) {
    log.w("DONE with error");
    next(error);
  }
}
