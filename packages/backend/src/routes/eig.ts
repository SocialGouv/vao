import {
  EigAdminRoutesSchema,
  TRACKING_ACTIONS,
  TRACKING_USER_TYPE,
} from "@vao/shared-bridge";
import express from "express";

import { eigController } from "../controllers";
import boCheckJWT from "../middlewares/bo-check-JWT";
import boCheckRole from "../middlewares/bo-check-role";
import canUpdateEig from "../middlewares/can-update-or-delete-eig";
import checkJWT from "../middlewares/checkJWT";
import checkPermissionBODeclarationSejour from "../middlewares/checkPermissionBODeclarationSejour";
import checkPermissionBOEIG from "../middlewares/checkPermissionBOEIG";
import checkPermissionDeclarationSejour from "../middlewares/checkPermissionDeclarationSejour";
import checkPermissionDeclarationSejourForEig from "../middlewares/checkPermissionDeclarationSejourEig";
import checkPermissionEIG from "../middlewares/checkPermissionEIG";
import getDepartements from "../middlewares/getDepartements";
import { requestValidatorMiddleware } from "../middlewares/requestValidatorMiddleware";
import trackEig from "../middlewares/trackEig";

const router = express.Router();

const boCheckRoleEig = boCheckRole(["eig"]);
const boCheckRoleDS = boCheckRole([
  "DemandeSejour_Lecture",
  "DemandeSejour_Ecriture",
]);

router.get("/me", checkJWT, eigController.getMe);
router.get(
  "/admin/ds/:declarationId",
  boCheckJWT,
  boCheckRoleEig,
  boCheckRoleDS,
  getDepartements,
  checkPermissionBODeclarationSejour,
  eigController.getByDsIdAdmin,
);
router.get(
  "/ds/:declarationId",
  checkJWT,
  checkPermissionDeclarationSejour,
  eigController.getByDsId,
);
router.get("/available-ds", checkJWT, eigController.getAvailableDs);
router.get(
  "/admin",
  boCheckJWT,
  boCheckRoleEig,
  requestValidatorMiddleware(EigAdminRoutesSchema["Get"]),
  eigController.getAdmin,
);
router.get(
  "/admin/pdf/:id",
  boCheckJWT,
  boCheckRoleEig,
  checkPermissionBOEIG,
  eigController.getPdf,
);

router.get(
  "/admin/total-to-read",
  boCheckJWT,
  boCheckRoleEig,
  eigController.getTotalToRead,
);
router.get(
  "/:id",
  checkJWT,
  checkPermissionEIG({ action: TRACKING_ACTIONS.reading }),
  eigController.getById,
);
router.get(
  "/admin/:id",
  boCheckJWT,
  boCheckRoleEig,
  checkPermissionBOEIG,
  eigController.getById,
);
router.post(
  "/",
  checkJWT,
  checkPermissionEIG({ action: TRACKING_ACTIONS.creation }),
  checkPermissionDeclarationSejourForEig,
  trackEig({
    action: TRACKING_ACTIONS.creation,
    userType: TRACKING_USER_TYPE.front,
  }),
  eigController.create,
);
router.put(
  "/:id",
  checkJWT,
  checkPermissionEIG({ action: TRACKING_ACTIONS.modification }),
  checkPermissionDeclarationSejourForEig,
  canUpdateEig,
  trackEig({
    action: TRACKING_ACTIONS.modification,
    userType: TRACKING_USER_TYPE.front,
  }),
  eigController.update,
);
router.post(
  "/depose/:id",
  checkJWT,
  checkPermissionEIG({ action: TRACKING_ACTIONS.modification }),
  canUpdateEig,
  trackEig({
    action: TRACKING_ACTIONS.modification,
    userType: TRACKING_USER_TYPE.front,
  }),
  eigController.depose,
);

router.delete(
  "/:id",
  checkJWT,
  checkPermissionEIG({ action: TRACKING_ACTIONS.deletion }),
  canUpdateEig,
  trackEig({
    action: TRACKING_ACTIONS.deletion,
    userType: TRACKING_USER_TYPE.front,
  }),
  eigController.delete,
);

router.post(
  "/admin/:id/mark-as-read",
  boCheckJWT,
  boCheckRoleEig,
  trackEig({
    action: TRACKING_ACTIONS.modification,
    userType: TRACKING_USER_TYPE.back,
  }),
  eigController.markAsRead,
);

export default router;
