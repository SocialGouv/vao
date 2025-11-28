import type { NextFunction, Response } from "express";

import Organisme from "../../services/Organisme";
import { UserRequest } from "../../types/request";
import AppError from "../../utils/error";
import logger from "../../utils/logger";

const log = logger(module.filename);

export default async function update(
  req: UserRequest,
  res: Response,
  next: NextFunction,
) {
  log.i("IN", req.body);
  const { body } = req;
  const organismeId = req.params.organismeId;
  const { type, parametre } = body;

  if (!type || !parametre || !organismeId) {
    log.w("missing or invalid parameter");

    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }
  if (parametre.siret) {
    try {
      const [organismeWithTheSiret, isComplet] = await Promise.all([
        Organisme.getBySiret(parametre.siret),
        Organisme.getIsComplet(organismeId),
      ]);

      if (
        !isComplet &&
        organismeWithTheSiret &&
        organismeWithTheSiret.organismeId.toString() !== organismeId.toString()
      ) {
        log.w(
          "DONE with error : Le siret ne peux pas etre modifé car il existe déjà en base",
        );
        throw new AppError(
          "Le siret ne peux pas etre modifé car il existe déjà en base",
          {
            name: "Forbidden - siret update - organisme incomplete",
            statusCode: 403,
          },
        );
      }
    } catch (error) {
      log.w("DONE with error");
      return next(error);
    }
  }
  try {
    await Organisme.update(type, parametre, organismeId);
    return res.status(200).json({
      message: "sauvegarde organisme OK",
      organismeId,
    });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
}
