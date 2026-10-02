import { HebergementUsagersRoutesSchema } from "@vao/shared-bridge";
import express from "express";

import checkJWT from "../../middlewares/checkJWT";
import checkPermissionOrganisme from "../../middlewares/checkPermissionOrganisme";
import { requestValidatorMiddleware } from "../../middlewares/requestValidatorMiddleware";
import { HebergementController } from "./hebergements.controller";

const router = express.Router();

router.post(
  "/site",
  checkJWT,
  requestValidatorMiddleware(HebergementUsagersRoutesSchema["PostSite"]),
  checkPermissionOrganisme,
  HebergementController.postSite,
);

router.post(
  "/site/similarites",
  checkJWT,
  requestValidatorMiddleware(
    HebergementUsagersRoutesSchema["CheckSimilarites"],
  ),
  HebergementController.checkSimilarites,
);

export default router;
