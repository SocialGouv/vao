import {
  SejourAdminRoutesSchema,
  SejourUsagersRoutesSchema,
  TRACKING_ACTIONS,
  TRACKING_USER_TYPE,
} from "@vao/shared-bridge";
import express from "express";

import { demandeSejourController } from "../controllers";
import boCheckJWT from "../middlewares/bo-check-JWT";
import boCheckRole from "../middlewares/bo-check-role";
import canUpdateDs from "../middlewares/can-update-ds";
import checkJWT from "../middlewares/checkJWT";
import checkPermissionBODeclarationSejour from "../middlewares/checkPermissionBODeclarationSejour";
import checkPermissionBODeclarationSejourUpdate from "../middlewares/checkPermissionBODeclarationSejourUpdate";
import checkPermissionDeclarationSejour from "../middlewares/checkPermissionDeclarationSejour";
import getDepartements from "../middlewares/getDepartements";
import { requestValidatorMiddleware } from "../middlewares/requestValidatorMiddleware";
import trackDemandeSejour from "../middlewares/trackDemandeSejour";

const router = express.Router();

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
  requestValidatorMiddleware(SejourAdminRoutesSchema["Get"]),
  demandeSejourController.getByDepartementCodes,
);
router.get(
  "/admin/messages",
  boCheckJWT,
  boCheckRoleDS,
  getDepartements,
  demandeSejourController.getDeclarationsMessages,
);
router.get(
  "/admin/extract",
  boCheckJWT,
  boCheckRoleDS,
  getDepartements,
  demandeSejourController.getExtract,
);
router.get(
  "/admin/extract-hebergement",
  boCheckJWT,
  boCheckRoleDS,
  getDepartements,
  demandeSejourController.getExtractHebergement,
);
router.get(
  "/admin/hebergements",
  boCheckJWT,
  boCheckRoleDS,
  getDepartements,
  demandeSejourController.getHebergementsByDepartementCodes,
);
router.get(
  "/admin/historique/:declarationId",
  boCheckJWT,
  boCheckRoleDS,
  getDepartements,
  checkPermissionBODeclarationSejour,
  demandeSejourController.historique,
);
router.get(
  "/admin/stats",
  boCheckJWT,
  getDepartements,
  demandeSejourController.getAdminStats,
);
router.get(
  "/admin/:declarationId",
  boCheckJWT,
  boCheckRoleDS,
  getDepartements,
  checkPermissionBODeclarationSejour,
  demandeSejourController.getByIdBo,
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
router.get("/stats", checkJWT, demandeSejourController.getStats);
router.get("/extract", checkJWT, demandeSejourController.getExtractFO);
router.get("/deprecated", checkJWT, demandeSejourController.getDeprecated);
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

router.get(
  "/",
  checkJWT,
  requestValidatorMiddleware(SejourUsagersRoutesSchema["Get"]),
  demandeSejourController.get,
);
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
  trackDemandeSejour({
    action: TRACKING_ACTIONS.modification,
    userType: TRACKING_USER_TYPE.front,
  }),
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

export default router;
