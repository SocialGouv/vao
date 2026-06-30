import { PersonneMoraleDto, SejourAdminRoutes } from "@vao/shared-bridge";
import type { NextFunction } from "express";

import type { RouteRequest, RouteResponse } from "../../types/request";

const DemandeSejour = require("../../services/DemandeSejour");
const Organisme = require("../../services/Organisme");
const { logger } = require("../../utils/logger");
const Sentry = require("@sentry/node");

const log = logger(module.filename);

async function getByDepartementCodes(
  req: RouteRequest<SejourAdminRoutes["Get"]>,
  res: RouteResponse<SejourAdminRoutes["Get"]>,
  next: NextFunction,
) {
  log.i("IN");
  const { decoded } = req;
  const { id: adminId, territoireCode } = decoded ?? {};
  if (!territoireCode) {
    return next(new Error("Missing territoireCode"));
  }
  log.d("userId", { adminId });
  const { limit, offset, sortBy, sortDirection, search } =
    req.validatedQuery ?? {};
  try {
    const params = {
      limit,
      offset,
      search: search ?? {},
      sortBy,
      sortDirection,
    };
    // Si c'est l'organisme siège social alors on recherche sur le siren, sinon on recherchera sur le siret
    // On ajoute alors un param dans le search
    if (params.search?.organismeId) {
      const organisme = await Organisme.getOne({
        "o.id": params.search.organismeId,
      });
      if (
        organisme?.personneMorale &&
        typeof organisme.personneMorale === "object"
      ) {
        if ((organisme.personneMorale as PersonneMoraleDto)?.siegeSocial) {
          params.search.siren = (
            organisme.personneMorale as PersonneMoraleDto
          ).siren;
        } else {
          params.search.siret = (
            organisme.personneMorale as PersonneMoraleDto
          ).siret;
        }
      }
    }
    if (!req.departements?.length) {
      return next(new Error("Missing departements"));
    }
    const demandesWithPagination = await DemandeSejour.getByDepartementCodes(
      params,
      territoireCode,
      req.departements.map((d) => d.value),
    );
    log.d(demandesWithPagination);
    return res.status(200).json({ demandesWithPagination });
  } catch (error) {
    return next(error);
  }
}

async function get(
  req: RouteRequest<SejourAdminRoutes["Get"]>,
  res: RouteResponse<SejourAdminRoutes["Get"]>,
  next: NextFunction,
) {
  // create new Sentry trace manually to enable profiler for its nested span
  Sentry.startNewTrace(async () => {
    Sentry.startSpan(
      {
        name: `Profile ${req.method} ${req.baseUrl}${req.path}`,
        op: "http",
      },
      async () => {
        await getByDepartementCodes(req, res, next);
      },
    );
  });
}
export { getByDepartementCodes };
export default get;
