import { AgrementUsagersRoutesSchema } from "@vao/shared-bridge";
import express from "express";

import checkJWT from "../../middlewares/checkJWT";
import checkPermissionAgrement from "../../middlewares/checkPermissionAgrement";
import checkPermissionOrganisme from "../../middlewares/checkPermissionOrganisme";
import { requestValidatorMiddleware } from "../../middlewares/requestValidatorMiddleware";
import { AgrementController } from "./agrements.controller";

const router = express.Router();

router.get(
  "/",
  checkJWT,
  requestValidatorMiddleware(AgrementUsagersRoutesSchema["GetList"]),
  AgrementController.getList,
);

router.get(
  "/:agrementId",
  checkJWT,
  requestValidatorMiddleware(AgrementUsagersRoutesSchema["GetOne"]),
  AgrementController.getOne,
);

router.post(
  "/",
  checkJWT,
  requestValidatorMiddleware(AgrementUsagersRoutesSchema["PostAgrement"]),
  checkPermissionOrganisme,
  AgrementController.post,
);

// TODO: Ajouter requestValidatorMiddleware(AgrementUsagersRoutesSchema["GetAllActivites"]) pour valider la route des activités
router.get("/activites", checkJWT, AgrementController.getAllActivites);

router.get(
  "/:agrementId/history",
  checkJWT,
  requestValidatorMiddleware(AgrementUsagersRoutesSchema["GetHistory"]),
  checkPermissionAgrement,
  AgrementController.getHistory,
);

router.patch(
  "/:agrementId/statut",
  checkJWT,
  requestValidatorMiddleware(AgrementUsagersRoutesSchema["PatchStatut"]),
  checkPermissionAgrement,
  AgrementController.patchStatut,
);

export default router;
