const express = require("express");

const router = express.Router();

const checkJWT = require("../middlewares/checkJWT");
const boCheckJWT = require("../middlewares/bo-check-JWT");
const boCheckRole = require("../middlewares/bo-check-role");
const checkPermissionBODeclarationSejour = require("../middlewares/checkPermissionBODeclarationSejour");
const checkPermissionBODeclarationSejourUpdate = require("../middlewares/checkPermissionBODeclarationSejourUpdate");
const checkPermissionDeclarationSejour = require("../middlewares/checkPermissionDeclarationSejour");
const getDepartements = require("../middlewares/getDepartements");
const checkComingFrom = require("../middlewares/checkComingFrom");
const messageController = require("../controllers/message");

const boCheckRoleDS = boCheckRole([
  "DemandeSejour_Lecture",
  "DemandeSejour_Ecriture",
]);

router.post(
  "/admin/:declarationId",
  boCheckJWT(),
  boCheckRoleDS,
  getDepartements,
  checkPermissionBODeclarationSejourUpdate,
  messageController.postByBO,
);
router.post(
  "/:declarationId",
  checkJWT(),
  checkPermissionDeclarationSejour,
  messageController.postByFO,
);
router.get(
  "/admin/read/:declarationId",
  boCheckJWT(),
  boCheckRoleDS,
  getDepartements,
  checkComingFrom,
  checkPermissionBODeclarationSejour,
  messageController.read,
);
router.get(
  "/admin/:declarationId",
  boCheckJWT(),
  boCheckRoleDS,
  getDepartements,
  checkPermissionBODeclarationSejour,
  messageController.get,
);
router.get(
  "/read/:declarationId",
  checkJWT(),
  checkPermissionDeclarationSejour,
  checkComingFrom,
  messageController.read,
);
router.get(
  "/:declarationId",
  checkJWT(),
  checkPermissionDeclarationSejour,
  messageController.get,
);

module.exports = router;
