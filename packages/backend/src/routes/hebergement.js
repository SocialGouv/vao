const express = require("express");

const router = express.Router();

const checkJWT = require("../middlewares/checkJWT");
const boCheckJWT = require("../middlewares/bo-check-JWT");
const checkPermissionHebergement = require("../middlewares/checkPermissionHebergement");
const checkPermissionHebergementUser = require("../middlewares/checkPermissionHebergementUser");
const checkStatutHebergement = require("../middlewares/checkStatutHebergement");
const getDepartements = require("../middlewares/getDepartements");
const hebergementController = require("../controllers/hebergement");
const HebergementHelper = require("../helpers/hebergement");

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
router.get(
  "/admin/:id",
  boCheckJWT,
  checkStatutHebergement(HebergementHelper.statuts.ACTIF),
  hebergementController.getById,
);
router.get("/siren/:siren", checkJWT, hebergementController.getBySiren);
router.get("/", checkJWT, hebergementController.get);
router.post("/", checkJWT, hebergementController.post);
router.post("/brouillon", checkJWT, hebergementController.postBrouillon);
router.put(
  "/:id/brouillon",
  checkJWT,
  checkStatutHebergement(HebergementHelper.statuts.BROUILLON),
  hebergementController.updateBrouillon,
);
router.put(
  "/:id/activate",
  checkJWT,
  checkStatutHebergement(HebergementHelper.statuts.BROUILLON),
  hebergementController.activate,
);
router.put(
  "/:id/desactivate",
  checkJWT,
  checkStatutHebergement(HebergementHelper.statuts.ACTIF),
  checkPermissionHebergementUser,
  hebergementController.desactivate,
);
router.put(
  "/:id/reactivate",
  checkJWT,
  checkStatutHebergement(HebergementHelper.statuts.DESACTIVE),
  checkPermissionHebergementUser,
  hebergementController.reactivate,
);

router.post(
  "/:id",
  checkJWT,
  checkStatutHebergement(HebergementHelper.statuts.ACTIF),
  checkPermissionHebergement,
  hebergementController.update,
);

module.exports = router;
