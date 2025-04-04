const express = require("express");

const router = express.Router();

const BOcheckJWT = require("../middlewares/bo-check-JWT");
const checkJWT = require("../middlewares/checkJWT");
const FOUserController = require("../controllers/fo-user");
const checkPermissionFoRole = require("../middlewares/checkPermissionFoRole");
const checkPermissionReadFo = require("../middlewares/checkPermissionReadFo");

// Renvoie la liste des utilisateurs du BO
router.get("/admin/list", BOcheckJWT, FOUserController.list);
router.get("/admin/extract/", BOcheckJWT, FOUserController.getExtract);
router.get("/get-roles/", checkJWT, FOUserController.getRoles);
router.get(
  "/get-one/:userId",
  checkJWT,
  checkPermissionReadFo,
  FOUserController.getOne,
);
router.get("/list", checkJWT, FOUserController.list);
router.get("/get-by-organisme", checkJWT, FOUserController.getByOrganisme);
router.post(
  "/roles/:userId",
  checkJWT,
  checkPermissionFoRole,
  FOUserController.updateRoles,
);

module.exports = router;
