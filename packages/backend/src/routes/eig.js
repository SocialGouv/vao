const express = require("express");
const checkJWT = require("../middlewares/checkJWT");
const canUpdateEig = require("../middlewares/can-update-or-delete-eig");
const checkPermissionDeclarationSejourForEig = require("../middlewares/checkPermissionDeclarationSejourEig");
const checkPermissionDeclarationSejour = require("../middlewares/checkPermissionDeclarationSejour");
const checkPermissionEIG = require("../middlewares/checkPermissionEIG");
const boCheckRole = require("../middlewares/bo-check-role");
const boCheckJWT = require("../middlewares/bo-check-JWT");

const { eigController } = require("../controllers");
const getDepartements = require("../middlewares/getDepartements");
const checkPermissionBODeclarationSejour = require("../middlewares/checkPermissionBODeclarationSejour");

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
router.get("/admin", boCheckJWT, boCheckRoleEig, eigController.getAdmin);
router.get("/:id", checkJWT, checkPermissionEIG, eigController.getById);
router.get("/admin/:id", boCheckJWT, boCheckRoleEig, eigController.getById);
router.post(
  "/",
  checkJWT,
  checkPermissionDeclarationSejourForEig,
  eigController.create,
);
router.put(
  "/:id",
  checkJWT,
  checkPermissionEIG,
  checkPermissionDeclarationSejourForEig,
  canUpdateEig,
  eigController.update,
);
router.post(
  "/depose/:id",
  checkJWT,
  checkPermissionEIG,
  canUpdateEig,
  eigController.depose,
);

router.delete(
  "/:id",
  checkJWT,
  checkPermissionEIG,
  canUpdateEig,
  eigController.delete,
);

router.post(
  "/admin/:id/mark-as-read",
  boCheckJWT,
  getDepartements,
  boCheckRoleEig,
  eigController.markAsRead,
);

module.exports = router;
