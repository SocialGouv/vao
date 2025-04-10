const express = require("express");
const checkJWT = require("../middlewares/checkJWT");
const canUpdateEig = require("../middlewares/can-update-or-delete-eig");
const checkPermissionDeclarationSejourForEig = require("../middlewares/checkPermissionDeclarationSejourEig");
const checkPermissionDeclarationSejour = require("../middlewares/checkPermissionDeclarationSejour");
const checkPermissionEIG = require("../middlewares/checkPermissionEIG");
const checkPermissionBOEIG = require("../middlewares/checkPermissionBOEIG");
const boCheckRole = require("../middlewares/bo-check-role");
const boCheckJWT = require("../middlewares/bo-check-JWT");
const trackEig = require("../middlewares/trackEig");

const { actions, userTypes } = require("../helpers/tracking");

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
router.get("/available-ds", checkJWT, eigController.getAvailableDs);
router.get("/admin", boCheckJWT, boCheckRoleEig, eigController.getAdmin);
router.get(
  "/:id",
  checkJWT,
  checkPermissionEIG({ action: actions.reading }),
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
  checkPermissionEIG({ action: actions.creation }),
  checkPermissionDeclarationSejourForEig,
  trackEig({ action: actions.creation, userType: userTypes.front }),
  eigController.create,
);
router.put(
  "/:id",
  checkJWT,
  checkPermissionEIG({ action: actions.modification }),
  checkPermissionDeclarationSejourForEig,
  canUpdateEig,
  trackEig({ action: actions.modification, userType: userTypes.front }),
  eigController.update,
);
router.post(
  "/depose/:id",
  checkJWT,
  checkPermissionEIG({ action: actions.modification }),
  canUpdateEig,
  trackEig({ action: actions.modification, userType: userTypes.front }),
  eigController.depose,
);

router.delete(
  "/:id",
  checkJWT,
  checkPermissionEIG({ action: actions.deletion }),
  canUpdateEig,
  trackEig({ action: actions.deletion, userType: userTypes.front }),
  eigController.delete,
);

router.post(
  "/admin/:id/mark-as-read",
  boCheckJWT,
  boCheckRoleEig,
  trackEig({ action: actions.modification, userType: userTypes.back }),
  eigController.markAsRead,
);

module.exports = router;
