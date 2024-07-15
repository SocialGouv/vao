const express = require("express");

const router = express.Router();

const checkJWT = require("../middlewares/checkJWT");
const boCheckJWT = require("../middlewares/bo-check-JWT");
const boCheckRole = require("../middlewares/bo-check-role");
const checkPermissionDeclarationSejour = require("../middlewares/checkPermissionDeclarationSejour");
const messageController = require("../controllers/message");
const getDepartements = require("../middlewares/getDepartements");

const boCheckRoleDS = boCheckRole([
  "DemandeSejour_Lecture",
  "DemandeSejour_Ecriture",
]);

router.post(
  "/admin/:declarationId",
  boCheckJWT,

  boCheckRoleDS,
  getDepartements,
  messageController.postByBO,
);

router.post(
  "/:declarationId",
  checkJWT,
  checkPermissionDeclarationSejour,
  messageController.postByFO,
);
router.get(
  "/admin/:declarationId",
  boCheckJWT,
  checkPermissionDeclarationSejour,
  messageController.get,
);
router.get(
  "/:declarationId",
  checkJWT,
  checkPermissionDeclarationSejour,
  messageController.get,
);

module.exports = router;
