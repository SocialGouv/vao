const express = require("express");

const router = express.Router();

const checkJWT = require("../middlewares/checkJWT");
const boCheckJWT = require("../middlewares/bo-check-JWT");
const checkPermissionHebergement = require("../middlewares/checkPermissionHebergement");
const getDepartements = require("../middlewares/getDepartements");
const hebergementController = require("../controllers/hebergement");

router.get(
  "/admin/",
  boCheckJWT,
  getDepartements,
  hebergementController.getByDepartements,
);

router.get(
  "/extract/",
  boCheckJWT,
  getDepartements,
  hebergementController.getExtract,
);
router.get(
  "/:id",
  checkJWT,
  checkPermissionHebergement,
  hebergementController.getById,
);
router.get("/admin/:id", boCheckJWT, hebergementController.getById);
router.get("/siren/:siren", checkJWT, hebergementController.getBySiren);
router.get("/", checkJWT, hebergementController.get);
router.post("/", checkJWT, hebergementController.post);
router.post(
  "/:id",
  checkJWT,
  checkPermissionHebergement,
  hebergementController.update,
);

module.exports = router;
