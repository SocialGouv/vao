import type { NextFunction, Response } from "express";

import { getCategoryDef } from "../helpers/documents";
import * as DocumentService from "../services/Document";
import type { UserRequest } from "../types/request";
import { isUserAllowedForDroit } from "../utils/droits";
import AppError from "../utils/error";
import { logger } from "../utils/logger";

const log = logger(module.filename);

const forbidden = () =>
  new AppError("Vous n'êtes pas autorisé à accéder à ce fichier", {
    statusCode: 403,
  });

export default async function checkPermissionBoToDownload(
  req: UserRequest,
  res: Response,
  next: NextFunction,
) {
  log.i("IN");
  const { uuid } = req.params;
  const userId = req.decoded?.id;

  if (!userId || !uuid) {
    return next(new AppError("Paramètre incorrect", { statusCode: 400 }));
  }

  let category: string | undefined;
  try {
    const fileMetaData = await DocumentService.getFileMetaData(uuid);
    if (!fileMetaData) {
      return next(new AppError("Fichier introuvable", { statusCode: 404 }));
    }
    category = fileMetaData.category;
  } catch (err) {
    return next(
      new AppError("La recherche du fichier a échoué", { cause: err }),
    );
  }

  const categoryDef = getCategoryDef(category);
  if (!categoryDef) {
    log.w(`Catégorie de document non gérée, accès refusé: ${category}`);
    return next(forbidden());
  }

  let resourceId: number | null;
  try {
    resourceId = await categoryDef.resolveResourceId(uuid);
  } catch (err) {
    return next(
      new AppError("La résolution de la ressource a échoué", { cause: err }),
    );
  }

  if (resourceId == null) {
    log.w(`Ressource introuvable pour le fichier ${uuid}, accès refusé`);
    return next(forbidden());
  }

  const isAllowed = await isUserAllowedForDroit(
    categoryDef.droit,
    resourceId,
    userId,
  );

  if (!isAllowed) {
    return next(forbidden());
  }

  log.i("DONE");
  return next();
}
