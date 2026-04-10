import { NextFunction, Response } from "express";

import { UserRequest } from "../types/request";
import AppError from "../utils/error";
import logger from "../utils/logger";
import { getPool } from "../utils/pgpool";

const log = logger(module.filename);

interface UserOrganismeRow {
  org_id: number;
}

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

  const agrementId = req.params?.agrementId ?? req.body?.agrementId ?? null;
  let organismeId = null;

  log.i("IN", { userId });

  if (agrementId) {
    const orgQuery = `SELECT organisme_id FROM front.agrements WHERE id = $1`;
    const orgResult = await getPool().query(orgQuery, [agrementId]);
    organismeId = orgResult.rows?.[0]?.organisme_id ?? null;
    if (!organismeId) {
      log.w("Aucun organismeId récupéré pour l'agrement");
      return next(
        new AppError("Aucun organismeId récupéré pour l'agrement", {
          statusCode: 404,
        }),
      );
    }
  } else {
    log.w("Aucun agrementId fourni");
    return next(
      new AppError("Aucun agrementId fourni", {
        statusCode: 400,
      }),
    );
  }

  const query = `
      SELECT uo.org_id
      FROM front.user_organisme uo
      JOIN front.users u ON uo.use_id = u.id
      WHERE u.id = $1
    `;
  const { rows } = await getPool().query(query, [userId]);

  if (!rows || rows.length === 0) {
    log.w("Aucun rattachement organisme trouvé pour l'utilisateur");
    return next(
      new AppError("Aucun rattachement organisme trouvé pour l'utilisateur", {
        statusCode: 403,
      }),
    );
  }

  const userOrgIds = rows.map((r: UserOrganismeRow) => r.org_id?.toString());
  if (!userOrgIds.includes(organismeId.toString())) {
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
