import type { NextFunction, Response } from "express";

import { getCategoryDef } from "../helpers/documents";
import * as DocumentService from "../services/Document";
import type { UserRequest } from "../types/request";
import { isUserAllowedForDroit } from "../utils/droits";
import AppError from "../utils/error";
import { logger } from "../utils/logger";

const log = logger(module.filename);

/**
 * Contrôle l'accès d'un agent back-office au téléchargement d'un document.
 *
 * Mécanique (fail-closed) :
 *   1. on récupère la catégorie du fichier ;
 *   2. le registre des catégories donne le domaine de droit et le resolver de
 *      ressource associés ;
 *   3. on résout la ressource protégée (demande de séjour, agrément…) ;
 *   4. on vérifie que l'utilisateur a le droit d'y accéder.
 *
 * Toute étape non concluante refuse l'accès.
 */
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

  // Le domaine de droit et le resolver dépendent de la catégorie du document.
  const categoryDef = getCategoryDef(category);
  if (!categoryDef) {
    log.w(`Catégorie de document non gérée, accès refusé: ${category}`);
    return next(
      new AppError("Vous n'êtes pas autorisé à accéder à ce fichier", {
        statusCode: 403,
      }),
    );
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
    return next(
      new AppError("Vous n'êtes pas autorisé à accéder à ce fichier", {
        statusCode: 403,
      }),
    );
  }

  const isAllowed = await isUserAllowedForDroit(
    categoryDef.droit,
    resourceId,
    userId,
  );

  if (!isAllowed) {
    return next(
      new AppError("Vous n'êtes pas autorisé à accéder à ce fichier", {
        statusCode: 403,
      }),
    );
  }

  log.i("DONE");
  return next();
}
