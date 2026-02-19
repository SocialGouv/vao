import { NextFunction, Response } from "express";

import { UserRequest } from "../types/request";
import AppError from "../utils/error";
import logger from "../utils/logger";
import { getPool } from "../utils/pgpool";

const log = logger(module.filename);

async function checkPermissionBOAgrement(
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
  const userId = req.decoded.id;
  log.i("IN");
  const query = `
      SELECT u.id
      FROM back.users u 
      INNER JOIN geo.territoires t ON t.code = u.ter_code
      WHERE u.id = $1 and t.parent_code = 'FRA'
    `;
  const { rows } = await getPool().query(query, [userId]);
  if (!rows || rows.length !== 1) {
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

export default checkPermissionBOAgrement;
