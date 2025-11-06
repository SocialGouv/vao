import { AgrementUsagersRoutesSchema } from "@vao/shared-bridge";
import express from "express";

import checkJWT from "../../middlewares/checkJWT";
import checkPermissionAgrement from "../../middlewares/checkPermissionAgrement";
import { requestValidatorMiddleware } from "../../middlewares/requestValidatorMiddleware";
import { AgrementController } from "./agrements.controller";

const router = express.Router();

router.get(
  "/organisme/:id",
  checkJWT,
  checkPermissionAgrement,
  requestValidatorMiddleware(AgrementUsagersRoutesSchema["GetOne"]),
  AgrementController.get,
);

router.post(
  "/",
  checkJWT,
  checkPermissionAgrement,
  requestValidatorMiddleware(AgrementUsagersRoutesSchema["Save"]),
  AgrementController.post,
);

export default router;
