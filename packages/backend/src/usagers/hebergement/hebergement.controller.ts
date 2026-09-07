import {
  type HebergementDto,
  type HebergementUsagersRoutes,
  type UniteHebergementPayloadDto,
  type UsagerHebergementBodyDto,
  FeatureFlagName,
} from "@vao/shared-bridge";
import type { NextFunction, Response as ExpressResponse } from "express";

import { statuts } from "../../helpers/hebergement";
import { getFileMetaData } from "../../services/Document";
import { FeatureFlagService } from "../../services/featureFlagService";
import FOUser from "../../services/FoUser";
import Hebergement from "../../services/hebergement/Hebergement";
import Organisme from "../../services/Organisme";
import {
  type LegacyHebergementPayload,
  applyUniteToHebergement,
  uniteToLegacyPayload,
} from "../../shared/hebergements/hebergements.mapping";
import { HebergementServiceShared } from "../../shared/hebergements/hebergements.service";
import type {
  RouteRequest,
  RouteResponse,
  UserRequest,
} from "../../types/request";
import AppError from "../../utils/error";
import { logger } from "../../utils/logger";

const log = logger(module.filename);

type HebergementInput = LegacyHebergementPayload & {
  uniteData?: UniteHebergementPayloadDto;
};

const toHebergementInput = (
  body: UsagerHebergementBodyDto,
): HebergementInput => {
  if ("uniteData" in body) {
    return {
      ...uniteToLegacyPayload(body),
      uniteData: body.uniteData,
    };
  }
  return body as LegacyHebergementPayload;
};

const FILE_FIELDS = [
  "fileDernierArreteAutorisationMaire",
  "fileDerniereAttestationSecurite",
  "fileReponseExploitantOuProprietaire",
] as const;

const resolveFileMetaData = async (
  value: unknown,
  fallback: unknown,
): Promise<unknown> => {
  if (typeof value !== "string" || value.length === 0) return fallback;
  const metadata = await getFileMetaData(value);
  return metadata ?? fallback;
};

export const HebergementUsagersController = {
  async activate(
    req: RouteRequest<HebergementUsagersRoutes["PutActivate"]>,
    res: ExpressResponse,
    next: NextFunction,
  ) {
    const hebergementId = req.params.id;
    const { decoded } = req;
    const userId = Number(decoded!.id);

    if (!hebergementId) {
      log.w("missing or invalid parameter");

      return next(
        new AppError("Paramètre incorrect", {
          statusCode: 400,
        }),
      );
    }
    if (!req.validatedBody || Object.keys(req.validatedBody).length === 0) {
      log.w("missing or invalid body");

      return next(
        new AppError("Paramètre incorrect", {
          statusCode: 400,
        }),
      );
    }

    const hebergement = toHebergementInput(
      req.validatedBody as UsagerHebergementBodyDto,
    );

    try {
      await Hebergement.updateWithoutHistory(
        userId,
        hebergementId,
        statuts.ACTIF,
        hebergement,
      );

      log.i("DONE");
      return res.sendStatus(200);
    } catch (error) {
      if ((error as Error).cause === "archive") {
        return next(
          new AppError((error as Error).message, {
            cause: (error as Error).cause,
          }),
        );
      }
      log.w("DONE with error");
      return next(error);
    }
  },

  async desactivate(
    req: UserRequest,
    res: ExpressResponse,
    next: NextFunction,
  ) {
    const hebergementId = req.params.id;
    const { decoded } = req;
    const userId = Number(decoded!.id);

    if (!hebergementId) {
      log.w("missing or invalid parameter");

      return next(
        new AppError("Paramètre incorrect", {
          statusCode: 400,
        }),
      );
    }
    const hebergement = await Hebergement.getById(hebergementId);
    if (!hebergement) {
      log.w("DONE with error");
      return next(
        new AppError("Hébergement non trouvée", {
          statusCode: 404,
        }),
      );
    }
    try {
      await Hebergement.update(
        userId,
        hebergementId,
        hebergement,
        statuts.DESACTIVE,
      );

      log.i("DONE");
      return res.sendStatus(200);
    } catch (error) {
      if ((error as Error).cause === "archive") {
        return next(
          new AppError((error as Error).message, {
            cause: (error as Error).cause,
          }),
        );
      }
      log.w("DONE with error");
      return next(error);
    }
  },

  async getBySiren(req: UserRequest, res: ExpressResponse, next: NextFunction) {
    log.i("IN");
    const hebergementSiren = req.params.siren;
    if (!hebergementSiren) {
      log.w("missing or invalid parameter");

      return next(
        new AppError("Paramètre incorrect", {
          statusCode: 400,
        }),
      );
    }
    try {
      const hebergement = await Hebergement.getBySiren(hebergementSiren);
      log.d(String(hebergementSiren));
      return res.status(200).json({ hebergement });
    } catch (error) {
      log.w("DONE with error");
      return next(error);
    }
  },

  async getList(req: UserRequest, res: ExpressResponse) {
    log.i("IN");
    const userId = req.decoded!.id;
    const search = req.query.search
      ? JSON.parse(req.query.search as string)
      : {};
    let hebergements;
    try {
      const organismeUserConnectedId = await FOUser.getUserOrganisme(userId);
      const searchByUserId =
        !search?.organismeId || organismeUserConnectedId === search.organismeId;
      if (!searchByUserId) {
        const organismeUserConnected = await Organisme.getOne({
          use_id: userId,
        });
        const organismeSiege = await Organisme.getSiege(
          organismeUserConnected.personneMorale.siret,
        );
        if (
          organismeSiege.organismeId === organismeUserConnected?.organismeId
        ) {
          hebergements = await Hebergement.getBySiren(
            organismeSiege.personneMorale.siren,
            search,
          );
        }
        return res.status(200).json({ hebergements });
      }
      if (searchByUserId) {
        hebergements = await Hebergement.getByUserId(userId, req.query);
        return res.status(200).json(hebergements);
      }
    } catch {
      log.w("DONE with error");
      return res.status(400).json({
        message:
          "une erreur est survenue durant la récupération des hebergements",
      });
    }
  },

  async getOne(
    req: RouteRequest<HebergementUsagersRoutes["GetOne"]>,
    res: RouteResponse<HebergementUsagersRoutes["GetOne"]>,
    next: NextFunction,
  ) {
    log.i("IN");
    const hebergementId = req.validatedParams!.id;

    try {
      const hebergement: HebergementDto | null =
        await Hebergement.getById(hebergementId);
      if (!hebergement) {
        return res.status(404).json({
          message: "hebergement not found",
          name: "NotFound",
        } as unknown as { hebergement: HebergementDto });
      }
      const isModuleSiteUniteAvailable =
        await FeatureFlagService.isFeatureAvailable(
          FeatureFlagName.MODULE_SITE_UNITE_HEBERGEMENT,
        );
      if (isModuleSiteUniteAvailable) {
        const uniteHebergement =
          await HebergementServiceShared.getUniteHebergementById(
            Number(hebergementId),
          );
        if (uniteHebergement) {
          const legacyInformationsLocaux = hebergement.informationsLocaux;
          const hebergementUniteApplied = applyUniteToHebergement(
            hebergement,
            uniteHebergement,
          );
          const informationsLocaux = hebergementUniteApplied.informationsLocaux;
          for (const field of FILE_FIELDS) {
            informationsLocaux[field] = await resolveFileMetaData(
              informationsLocaux[field],
              legacyInformationsLocaux[field],
            );
          }
          res.json({ hebergement: hebergementUniteApplied });
          return;
        }
      }

      log.d("hebergement", hebergement);
      res.json({ hebergement });
    } catch (error) {
      log.w("DONE with error");
      next(error);
    }
  },

  async post(
    req: RouteRequest<HebergementUsagersRoutes["Post"]>,
    res: ExpressResponse,
    next: NextFunction,
  ) {
    log.i("IN");
    const { decoded } = req;
    const userId = Number(decoded!.id);
    if (!req.validatedBody || Object.keys(req.validatedBody).length === 0) {
      log.w("missing or invalid body");

      return next(
        new AppError("Paramètre incorrect", {
          statusCode: 400,
        }),
      );
    }

    const hebergement = toHebergementInput(
      req.validatedBody as UsagerHebergementBodyDto,
    );

    try {
      const organismeId = await FOUser.getUserOrganisme(userId);
      const hebergementId = await Hebergement.create(
        userId,
        organismeId,
        statuts.ACTIF,
        hebergement,
      );

      return res.status(200).json({
        id: hebergementId,
        message: "sauvegarde hebegement OK",
      });
    } catch (error) {
      log.w("DONE with error");
      return next(error);
    }
  },

  async postBrouillon(
    req: RouteRequest<HebergementUsagersRoutes["PostBrouillon"]>,
    res: ExpressResponse,
    next: NextFunction,
  ) {
    log.i("postbrouillon - IN");
    const { decoded } = req;
    const userId = Number(decoded!.id);
    if (!req.validatedBody || Object.keys(req.validatedBody).length === 0) {
      log.w("missing or invalid body");

      return next(
        new AppError("Paramètre incorrect", {
          statusCode: 400,
        }),
      );
    }

    const hebergement = toHebergementInput(
      req.validatedBody as UsagerHebergementBodyDto,
    );

    try {
      const organismeId = await FOUser.getUserOrganisme(userId);
      const id = await Hebergement.create(
        userId,
        organismeId,
        statuts.BROUILLON,
        hebergement,
      );

      return res.status(200).json({
        id,
        message: "sauvegarde hebegement OK",
      });
    } catch (error) {
      log.w("DONE with error");
      return next(error);
    }
  },

  async reactivate(req: UserRequest, res: ExpressResponse, next: NextFunction) {
    const hebergementId = req.params.id;
    const { decoded } = req;
    const userId = Number(decoded!.id);

    if (!hebergementId) {
      log.w("missing or invalid parameter");

      return next(
        new AppError("Paramètre incorrect", {
          statusCode: 400,
        }),
      );
    }
    const statut = await Hebergement.getStatut(hebergementId);
    if (!statut) {
      log.w("DONE with error");
      return next(
        new AppError("Hébergement non trouvée", {
          statusCode: 404,
        }),
      );
    }
    try {
      await Hebergement.updateStatut(userId, hebergementId, statuts.ACTIF);

      log.i("DONE");
      return res.sendStatus(200);
    } catch (error) {
      if ((error as Error).cause === "archive") {
        return next(
          new AppError((error as Error).message, {
            cause: (error as Error).cause,
          }),
        );
      }
      log.w("DONE with error");
      return next(error);
    }
  },

  async update(
    req: RouteRequest<HebergementUsagersRoutes["PostById"]>,
    res: ExpressResponse,
    next: NextFunction,
  ) {
    const hebergementId = req.params.id;
    const { decoded } = req;
    const userId = Number(decoded!.id);
    if (!req.validatedBody || Object.keys(req.validatedBody).length === 0) {
      log.w("missing or invalid body");

      return next(
        new AppError("Paramètre incorrect", {
          statusCode: 400,
        }),
      );
    }

    const hebergement = toHebergementInput(
      req.validatedBody as UsagerHebergementBodyDto,
    );

    if (!hebergementId) {
      log.w("missing or invalid parameter");

      return next(
        new AppError("Paramètre incorrect", {
          statusCode: 400,
        }),
      );
    }

    try {
      await Hebergement.update(
        userId,
        hebergementId,
        hebergement,
        statuts.ACTIF,
      );

      log.i("DONE");
      return res.sendStatus(200);
    } catch (error) {
      if ((error as Error).cause === "archive") {
        return next(
          new AppError((error as Error).message, {
            cause: (error as Error).cause,
          }),
        );
      }
      log.w("DONE with error");
      return next(error);
    }
  },

  async updateBrouillon(
    req: RouteRequest<HebergementUsagersRoutes["PutBrouillon"]>,
    res: ExpressResponse,
    next: NextFunction,
  ) {
    const hebergementId = req.params.id;
    const { decoded } = req;
    const userId = Number(decoded!.id);
    if (!req.validatedBody || Object.keys(req.validatedBody).length === 0) {
      log.w("missing or invalid body");

      return next(
        new AppError("Paramètre incorrect", {
          statusCode: 400,
        }),
      );
    }

    const hebergement = toHebergementInput(
      req.validatedBody as UsagerHebergementBodyDto,
    );

    if (!hebergementId) {
      log.w("missing or invalid parameter");

      return next(
        new AppError("Paramètre incorrect", {
          statusCode: 400,
        }),
      );
    }

    try {
      await Hebergement.updateWithoutHistory(
        userId,
        hebergementId,
        statuts.BROUILLON,
        hebergement,
      );

      log.i("DONE");
      return res.sendStatus(200);
    } catch (error) {
      if ((error as Error).cause === "archive") {
        return next(
          new AppError((error as Error).message, {
            cause: (error as Error).cause,
          }),
        );
      }
      log.w("DONE with error");
      return next(error);
    }
  },
};
