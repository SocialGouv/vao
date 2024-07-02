const express = require("express");

const router = express.Router();

const checkJWT = require("../middlewares/checkJWT");
const boCheckJWT = require("../middlewares/bo-check-JWT");
const boCheckRole = require("../middlewares/bo-check-role");

const demandeSejourController = require("../controllers/demandeSejour");
const getDepartements = require("../middlewares/getDepartements");
const canUpdateDs = require("../middlewares/can-update-ds");

const boCheckRoleDS = boCheckRole([
  "DemandeSejour_Lecture",
  "DemandeSejour_Ecriture",
]);

// Gère une connexion via mot de passe.
router.get(
  "/admin",
  boCheckJWT,
  boCheckRoleDS,
  getDepartements,
  demandeSejourController.getByDepartementCodes,
);
router.get(
  "/admin/:id",
  boCheckJWT,
  boCheckRoleDS,
  getDepartements,
  demandeSejourController.getByIdBo,
);
router.get(
  "/admin/historique/:id",
  boCheckJWT,
  boCheckRoleDS,
  demandeSejourController.historique,
);
router.post(
  "/admin/:declarationId/prise-en-charge",
  boCheckJWT,
  boCheckRoleDS,
  getDepartements,
  demandeSejourController.prendEnCharge,
);
router.post(
  "/admin/:declarationId/demande-complements",
  boCheckJWT,
  boCheckRoleDS,
  getDepartements,
  demandeSejourController.demandeComplements,
);
router.post(
  "/admin/:declarationId/refus",
  boCheckJWT,
  boCheckRoleDS,
  getDepartements,
  demandeSejourController.refus,
);
router.post(
  "/admin/:declarationId/enregistrement-2-mois",
  boCheckJWT,
  boCheckRoleDS,
  getDepartements,
  demandeSejourController.enregistrementDemande2Mois,
);
router.get("/:id", checkJWT, demandeSejourController.getById);
router.get("/historique/:id", checkJWT, demandeSejourController.historique);

router.get("/", checkJWT, demandeSejourController.get);
router.post("/depose/:id", checkJWT, demandeSejourController.depose);
router.post("/:id/copy", checkJWT, demandeSejourController.copy);
router.post("/:id", checkJWT, canUpdateDs, demandeSejourController.update);
router.post("/", checkJWT, demandeSejourController.post);
router.delete("/:id", checkJWT, demandeSejourController.delete);
module.exports = router;
