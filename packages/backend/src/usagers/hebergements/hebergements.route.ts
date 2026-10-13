import { HebergementUsagersRoutesSchema } from "@vao/shared-bridge";
import express from "express";

import checkJWT from "../../middlewares/checkJWT";
import checkPermissionOrganisme from "../../middlewares/checkPermissionOrganisme";
import { requestValidatorMiddleware } from "../../middlewares/requestValidatorMiddleware";
import { HebergementController } from "./hebergements.controller";

const router = express.Router();

router.get(
  "/site/:siteId",
  checkJWT,
  requestValidatorMiddleware(HebergementUsagersRoutesSchema["GetSite"]),
  checkPermissionOrganisme,
  HebergementController.getSite,
);

router.post(
  "/site",
  checkJWT,
  requestValidatorMiddleware(HebergementUsagersRoutesSchema["PostSite"]),
  checkPermissionOrganisme,
  HebergementController.postSite,
);

router.patch(
  "/site/:siteId",
  checkJWT,
  requestValidatorMiddleware(HebergementUsagersRoutesSchema["PatchSite"]),
  checkPermissionOrganisme,
  HebergementController.patchSite,
);

router.post(
  "/site/similarites",
  checkJWT,
  requestValidatorMiddleware(
    HebergementUsagersRoutesSchema["CheckSimilarites"],
  ),
  checkPermissionOrganisme,
  HebergementController.checkSimilarites,
);

router.post(
  "/site/type-hebergement-control",
  checkJWT,
  requestValidatorMiddleware(
    HebergementUsagersRoutesSchema["CheckTypeHebergement"],
  ),
  checkPermissionOrganisme,
  HebergementController.checkTypeHebergement,
);

router.post(
  "/site/:siteId/unites",
  checkJWT,
  requestValidatorMiddleware(
    HebergementUsagersRoutesSchema["PostUniteHebergement"],
  ),
  checkPermissionOrganisme,
  HebergementController.postUniteHebergement,
);

router.patch(
  "/site/:siteId/unites/:uniteId",
  checkJWT,
  requestValidatorMiddleware(
    HebergementUsagersRoutesSchema["PatchUniteHebergement"],
  ),
  checkPermissionOrganisme,
  HebergementController.patchUniteHebergement,
);

export default router;
