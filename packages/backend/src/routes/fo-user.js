const express = require("express");
const { roles } = require("../helpers/users");

const router = express.Router();

const BOcheckJWT = require("../middlewares/bo-check-JWT");
const checkJWT = require("../middlewares/checkJWT");
const FOUserController = require("../controllers/fo-user");
const checkPermissionFoRole = require("../middlewares/checkPermissionFoRole");
const checkPermissionBOForUpdateStatusFo = require("../middlewares/checkPermissionBOForUpdateStatusFo");
const checkPermissionBOForFoStatus = require("../middlewares/checkPermissionBoForFoStatus");
const checkPermissionFOForUpdateStatusFo = require("../middlewares/checkPermissionFOForUpdateStatusFo");

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

module.exports = router;
