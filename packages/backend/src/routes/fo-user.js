const express = require("express");
const { roles } = require("../helpers/users");

const router = express.Router();

const BOcheckJWT = require("../middlewares/bo-check-JWT");
const checkJWT = require("../middlewares/checkJWT");
const FOUserController = require("../controllers/fo-user");
const checkPermissionFoRole = require("../middlewares/checkPermissionFoRole");
const checkPermissionBOForUpdateStatusFo = require("../middlewares/checkPermissionBOForUpdateStatusFo");

// Renvoie la liste des utilisateurs du BO
router.get("/admin/list", BOcheckJWT, FOUserController.list);
router.get(
  "/admin/list-to-validate",
  BOcheckJWT,
  FOUserController.listToValidate,
);
router.post(
  "/admin/update-status/:userId",
  BOcheckJWT,
  checkPermissionBOForUpdateStatusFo,
  FOUserController.updateStatus,
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

module.exports = router;
