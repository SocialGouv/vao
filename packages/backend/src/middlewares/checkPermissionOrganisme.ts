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

  const query = `
      SELECT uo.org_id
      FROM 
      front.user_organisme uo 
      JOIN front.users u ON uo.use_id = u.id
      WHERE u.id = $1
    `;
  const { rows } = await getPool().query(query, [userId]);
  if (
    !rows ||
    rows.length === 0 ||
    !rows
      .map((r: { org_id: number | string }) => r.org_id.toString())
      .includes(organismeId.toString())
  ) {
    return next(
      new AppError("Utilisateur non autorisé à accéder à l'organisme", {
        statusCode: 403,
      }),
    );
  }
  log.i("DONE");
  next();
}

export default checkPermissionOrganisme;
