import { NextFunction, Response } from "express";

import { UserRequest } from "../types/request";
import AppError from "../utils/error";
import logger from "../utils/logger";
import { getPool } from "../utils/pgpool";

const log = logger(module.filename);

async function checkPermissionOrganisme(
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
  const organismeId =
    req.params.organismeId || req.body.organismeId || req.query.organismeId;

  log.i("IN", { userId });

  if (!/^\d+$/.test(organismeId)) {
    return next(
      new AppError("organismeId doit être un entier", {
        statusCode: 400,
      }),
    );
  }

  const query = `
    SELECT uo.org_id as organismeId
    FROM front.user_organisme uo
    JOIN front.users u ON uo.use_id = u.id
    WHERE u.id = $1 AND uo.org_id = $2
  `;
  const { rows } = await getPool().query(query, [userId, organismeId]);
  if (!rows || rows.length === 0) {
    return next(
      new AppError("Utilisateur non autorisé à accéder à l'organisme", {
        statusCode: 403,
      }),
    );
  }
  next();
}

export default checkPermissionOrganisme;
