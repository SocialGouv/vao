import { AgrementAdminRoutesSchema } from "@vao/shared-bridge";
import express from "express";

import boCheckJWT from "../../middlewares/bo-check-JWT";
import checkPermissionBOAgrement from "../../middlewares/checkPermissionBOAgrement";
import { requestValidatorMiddleware } from "../../middlewares/requestValidatorMiddleware";
import { AgrementController } from "./agrements.controller";

const router = express.Router();

router.get(
  "/",
  boCheckJWT,
  requestValidatorMiddleware(AgrementAdminRoutesSchema["GetList"]),
  checkPermissionBOAgrement,
  AgrementController.getList,
);

router.get(
  "/:agrementId",
  boCheckJWT,
  requestValidatorMiddleware(AgrementAdminRoutesSchema["GetOne"]),
  checkPermissionBOAgrement,
  AgrementController.getOne,
);

router.get(
  "/history/:agrementId",
  boCheckJWT,
  requestValidatorMiddleware(AgrementAdminRoutesSchema["GetHistory"]),
  checkPermissionBOAgrement,
  AgrementController.getHistory,
);

router.post(
  "/:agrementId/message",
  boCheckJWT,
  requestValidatorMiddleware(AgrementAdminRoutesSchema["PostMessage"]),
  checkPermissionBOAgrement,
  AgrementController.postMessage,
);

router.patch(
  "/:agrementId/statut",
  boCheckJWT,
  requestValidatorMiddleware(AgrementAdminRoutesSchema["PatchStatut"]),
  checkPermissionBOAgrement,
  AgrementController.patchStatut,
);

export default router;
