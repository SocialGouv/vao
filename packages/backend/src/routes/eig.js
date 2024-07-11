const express = require("express");
const checkJWT = require("../middlewares/checkJWT");
const canUpdateEig = require("../middlewares/can-update-eig");
const checkPermissionDeclarationSejourForEig = require("../middlewares/checkPermissionDeclarationSejourEig");
const checkPermissionEIG = require("../middlewares/checkPermissionEIG");

const { eigController } = require("../controllers");

const router = express.Router();

router.get("/me", checkJWT, eigController.getMe);
router.get("/:id", checkJWT, checkPermissionEIG, eigController.getById);
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

module.exports = router;
