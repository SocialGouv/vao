const express = require("express");

const router = express.Router();

const checkJWT = require("../middlewares/checkJWT");
const boCheckJWT = require("../middlewares/bo-check-JWT");
const boCheckRole = require("../middlewares/bo-check-role");
const checkPermissionDeclarationSejour = require("../middlewares/checkPermissionDeclarationSejour");
const checkPermissionBODeclarationSejour = require("../middlewares/checkPermissionBODeclarationSejour");
const checkPermissionBODeclarationSejourUpdate = require("../middlewares/checkPermissionBODeclarationSejourUpdate");

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
  "/admin/extract",
  boCheckJWT,
  boCheckRoleDS,
  getDepartements,
  demandeSejourController.getExtract,
);
router.get(
  "/admin/:declarationId",
  boCheckJWT,
  boCheckRoleDS,
  getDepartements,
  checkPermissionBODeclarationSejour,
  demandeSejourController.getByIdBo,
);
router.get(
  "/admin/historique/:declarationId",
  boCheckJWT,
  boCheckRoleDS,
  getDepartements,
  checkPermissionBODeclarationSejour,
  demandeSejourController.historique,
);
router.post(
  "/admin/:declarationId/prise-en-charge",
  boCheckJWT,
  boCheckRoleDS,
  getDepartements,
  checkPermissionBODeclarationSejourUpdate,
  demandeSejourController.prendEnCharge,
);
router.post(
  "/admin/:declarationId/demande-complements",
  boCheckJWT,
  boCheckRoleDS,
  getDepartements,
  checkPermissionBODeclarationSejourUpdate,
  demandeSejourController.demandeComplements,
);
router.post(
  "/admin/:declarationId/refus",
  boCheckJWT,
  boCheckRoleDS,
  getDepartements,
  checkPermissionBODeclarationSejourUpdate,
  demandeSejourController.refus,
);
router.post(
  "/admin/:declarationId/enregistrement-2-mois",
  boCheckJWT,
  boCheckRoleDS,
  getDepartements,
  checkPermissionBODeclarationSejourUpdate,
  demandeSejourController.enregistrementDemande2Mois,
);
router.get(
  "/:declarationId",
  checkJWT,
  checkPermissionDeclarationSejour,
  demandeSejourController.getById,
);
router.get(
  "/historique/:declarationId",
  checkJWT,
  checkPermissionDeclarationSejour,
  demandeSejourController.historique,
);

router.get("/", checkJWT, demandeSejourController.get);
router.post(
  "/depose/:declarationId",
  checkJWT,
  checkPermissionDeclarationSejour,
  demandeSejourController.depose,
);
router.post(
  "/:declarationId/copy",
  checkJWT,
  checkPermissionDeclarationSejour,
  demandeSejourController.copy,
);
router.post(
  "/:declarationId",
  checkJWT,
  checkPermissionDeclarationSejour,
  canUpdateDs,
  demandeSejourController.update,
);
router.post("/", checkJWT, demandeSejourController.post);
router.delete(
  "/:declarationId",
  checkJWT,
  checkPermissionDeclarationSejour,
  demandeSejourController.delete,
);
router.post(
  "/cancel/:declarationId",
  checkJWT,
  checkPermissionDeclarationSejour,
  demandeSejourController.cancel,
);
module.exports = router;
