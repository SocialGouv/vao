import express from "express";

import { messageController } from "../controllers";
import boCheckJWT from "../middlewares/bo-check-JWT";
import boCheckRole from "../middlewares/bo-check-role";
import checkComingFrom from "../middlewares/checkComingFrom";
import checkJWT from "../middlewares/checkJWT";
import checkPermissionBODeclarationSejour from "../middlewares/checkPermissionBODeclarationSejour";
import checkPermissionBODeclarationSejourUpdate from "../middlewares/checkPermissionBODeclarationSejourUpdate";
import checkPermissionDeclarationSejour from "../middlewares/checkPermissionDeclarationSejour";
import getDepartements from "../middlewares/getDepartements";

const router = express.Router();

const boCheckRoleDS = boCheckRole([
  "DemandeSejour_Lecture",
  "DemandeSejour_Ecriture",
]);

router.post(
  "/admin/:declarationId",
  boCheckJWT,
  boCheckRoleDS,
  getDepartements,
  checkPermissionBODeclarationSejourUpdate,
  messageController.postByBO,
);
router.post(
  "/:declarationId",
  checkJWT,
  checkPermissionDeclarationSejour,
  messageController.postByFO,
);
router.get(
  "/admin/read/:declarationId",
  boCheckJWT,
  boCheckRoleDS,
  getDepartements,
  checkComingFrom,
  checkPermissionBODeclarationSejour,
  messageController.read,
);
router.get(
  "/admin/:declarationId",
  boCheckJWT,
  boCheckRoleDS,
  getDepartements,
  checkPermissionBODeclarationSejour,
  messageController.get,
);
router.get(
  "/read/:declarationId",
  checkJWT,
  checkPermissionDeclarationSejour,
  checkComingFrom,
  messageController.read,
);
router.get(
  "/:declarationId",
  checkJWT,
  checkPermissionDeclarationSejour,
  messageController.get,
);

export default router;
