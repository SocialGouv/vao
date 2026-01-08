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

const { TRACKING_ACTIONS, TRACKING_USER_TYPE } = require("@vao/shared-bridge");

const { eigController } = require("../controllers");
const getDepartements = require("../middlewares/getDepartements");
const checkPermissionBODeclarationSejour = require("../middlewares/checkPermissionBODeclarationSejour");

const router = express.Router();

const boCheckRoleEig = boCheckRole(["eig"]);
const boCheckRoleDS = boCheckRole([
  "DemandeSejour_Lecture",
  "DemandeSejour_Ecriture",
]);

router.get("/me", checkJWT(), eigController.getMe);
router.get(
  "/admin/ds/:declarationId",
  boCheckJWT(),
  boCheckRoleEig,
  boCheckRoleDS,
  getDepartements,
  checkPermissionBODeclarationSejour,
  eigController.getByDsIdAdmin,
);
router.get(
  "/ds/:declarationId",
  checkJWT(),
  checkPermissionDeclarationSejour,
  eigController.getByDsId,
);
router.get("/available-ds", checkJWT(), eigController.getAvailableDs);
router.get("/admin", boCheckJWT(), boCheckRoleEig, eigController.getAdmin);
router.get(
  "/admin/pdf/:id",
  boCheckJWT(),
  boCheckRoleEig,
  checkPermissionBOEIG,
  eigController.getPdf,
);

router.get(
  "/admin/total-to-read",
  boCheckJWT(),
  boCheckRoleEig,
  eigController.getTotalToRead,
);
router.get(
  "/:id",
  checkJWT(),
  checkPermissionEIG({ action: TRACKING_ACTIONS.reading }),
  eigController.getById,
);
router.get(
  "/admin/:id",
  boCheckJWT(),
  boCheckRoleEig,
  checkPermissionBOEIG,
  eigController.getById,
);
router.post(
  "/",
  checkJWT(),
  checkPermissionEIG({ action: TRACKING_ACTIONS.creation }),
  checkPermissionDeclarationSejourForEig,
  trackEig({
    action: TRACKING_ACTIONS.creation,
    userType: TRACKING_USER_TYPE.front,
  }),
  eigController.create,
);
router.put(
  "/:id",
  checkJWT(),
  checkPermissionEIG({ action: TRACKING_ACTIONS.modification }),
  checkPermissionDeclarationSejourForEig,
  canUpdateEig,
  trackEig({
    action: TRACKING_ACTIONS.modification,
    userType: TRACKING_USER_TYPE.front,
  }),
  eigController.update,
);
router.post(
  "/depose/:id",
  checkJWT(),
  checkPermissionEIG({ action: TRACKING_ACTIONS.modification }),
  canUpdateEig,
  trackEig({
    action: TRACKING_ACTIONS.modification,
    userType: TRACKING_USER_TYPE.front,
  }),
  eigController.depose,
);

router.delete(
  "/:id",
  checkJWT(),
  checkPermissionEIG({ action: TRACKING_ACTIONS.deletion }),
  canUpdateEig,
  trackEig({
    action: TRACKING_ACTIONS.deletion,
    userType: TRACKING_USER_TYPE.front,
  }),
  eigController.delete,
);

router.post(
  "/admin/:id/mark-as-read",
  boCheckJWT(),
  boCheckRoleEig,
  trackEig({
    action: TRACKING_ACTIONS.modification,
    userType: TRACKING_USER_TYPE.back,
  }),
  eigController.markAsRead,
);

module.exports = router;
