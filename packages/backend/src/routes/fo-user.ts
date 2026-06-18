import express from "express";

import { FOUserController } from "../controllers";
import { roles } from "../helpers/users";
import BOcheckJWT from "../middlewares/bo-check-JWT";
import checkJWT from "../middlewares/checkJWT";
import checkJWTWithoutCGU from "../middlewares/checkJWTWithoutCGU";
import checkPermissionBOForFoStatus from "../middlewares/checkPermissionBoForFoStatus";
import checkPermissionBOForUpdateStatusFo from "../middlewares/checkPermissionBOForUpdateStatusFo";
import checkPermissionFOForUpdateStatusFo from "../middlewares/checkPermissionFOForUpdateStatusFo";
import checkPermissionFoRole from "../middlewares/checkPermissionFoRole";

const router = express.Router();

// Acceptation des CGU
router.post("/accept-cgu", checkJWTWithoutCGU, FOUserController.acceptCgu);
// Renvoie la liste des utilisateurs du BO
router.get("/admin/list", BOcheckJWT, FOUserController.list);
router.get(
  "/admin/list-to-validate",
  BOcheckJWT,
  checkPermissionBOForFoStatus,
  FOUserController.listToValidate,
);
router.post(
  "/admin/update-status/:userId",
  BOcheckJWT,
  checkPermissionBOForUpdateStatusFo,
  FOUserController.updateStatus({ source: "BO" }),
);
router.get("/admin/extract/", BOcheckJWT, FOUserController.getExtract);
router.get("/get-roles/", checkJWT, FOUserController.getRoles);
router.get(
  "/get-one/:userId",
  checkJWT,
  checkPermissionFoRole({ role: roles.EIG_LECTURE }),
  FOUserController.getOne,
);
router.get("/list", checkJWT, FOUserController.list);
router.get("/get-by-organisme", checkJWT, FOUserController.getByOrganisme);
router.post(
  "/roles/:userId",
  checkJWT,
  checkPermissionFoRole({ role: roles.EIG_ECRITURE }),
  FOUserController.updateRoles,
);
router.post(
  "/change-status/:userId",
  checkJWT,
  checkPermissionFOForUpdateStatusFo,
  FOUserController.changeStatus,
);
router.post(
  "/update-status/:userId",
  checkJWT,
  checkPermissionFOForUpdateStatusFo,
  FOUserController.updateStatus({ source: "FO" }),
);

export default router;
