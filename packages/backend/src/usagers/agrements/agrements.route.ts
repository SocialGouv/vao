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
  requestValidatorMiddleware(AgrementUsagersRoutesSchema["GetOne"]),
  checkPermissionAgrement,
  AgrementController.get,
);

router.post(
  "/",
  checkJWT,
  requestValidatorMiddleware(AgrementUsagersRoutesSchema["PostAgrement"]),
  checkPermissionAgrement,
  AgrementController.post,
);

// TODO: Ajouter requestValidatorMiddleware(AgrementUsagersRoutesSchema["GetAllActivites"]) pour valider la route des activités
router.get("/activites", checkJWT, AgrementController.getAllActivites);

router.get(
  "/history/:agrementId",
  checkJWT,
  requestValidatorMiddleware(AgrementUsagersRoutesSchema["GetHistory"]),
  checkPermissionAgrement,
  AgrementController.getHistory,
);

export default router;
