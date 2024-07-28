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
  "/admin/:id",
  boCheckJWT,
  boCheckRoleDS,
  getDepartements,
  messageController.postByBO,
);

router.post(
  "/:id",
  checkJWT,
  checkPermissionDeclarationSejour,
  messageController.postByFO,
);
router.get("/admin/:id", boCheckJWT, messageController.get);
router.get(
  "/:id",
  checkJWT,
  checkPermissionDeclarationSejour,
  messageController.get,
);

module.exports = router;
