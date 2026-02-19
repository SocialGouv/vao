import { NextFunction, Response } from "express";

import { UserRequest } from "../types/request";
import AppError from "../utils/error";
import logger from "../utils/logger";
import { getPool } from "../utils/pgpool";

const log = logger(module.filename);

async function checkPermissionAgrement(
  req: UserRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.decoded || typeof req.decoded.id === "undefined") {
    log.w("Utilisateur non authentifié ou id manquant");
    return next(
      new AppError("Authentification requise", {
        statusCode: 401,
      }),
    );
  }
  const { id: userId } = req.decoded;
  // Récupère l'Id de l'organisme en fonction de la provenance (POST ou GET)
  const organismeId = req.body?.organismeId ?? req.params?.id ?? null;
  log.i("IN");

  const query = `
      SELECT uo.org_id
      FROM front.user_organisme uo 
      JOIN front.users u ON uo.use_id = u.id
      WHERE u.id = $1
    `;
  const { rows } = await getPool().query(query, [userId]);
  if (
    !rows ||
    rows.length !== 1 ||
    rows[0].org_id.toString() !== organismeId.toString()
  ) {
    log.w("Utilisateur non autorisé à modifier l'agrement");
    return next(
      new AppError("Vous n'êtes pas autorisé à modifier cet agrément", {
        statusCode: 403,
      }),
    );
  }
  log.i("DONE");
  next();
}

export default checkPermissionAgrement;
