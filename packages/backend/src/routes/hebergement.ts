import { HebergementRoutesSchema } from "@vao/shared-bridge";
import express from "express";

import hebergementController from "../controllers/hebergement";
import HebergementHelper from "../helpers/hebergement";
import boCheckJWT from "../middlewares/bo-check-JWT";
import checkJWT from "../middlewares/checkJWT";
import checkPermissionHebergement from "../middlewares/checkPermissionHebergement";
import checkPermissionHebergementUser from "../middlewares/checkPermissionHebergementUser";
import checkStatutHebergement from "../middlewares/checkStatutHebergement";
import getDepartements from "../middlewares/getDepartements";
import { requestValidatorMiddleware } from "../middlewares/requestValidatorMiddleware";

const router = express.Router();

router.get(
  "/admin/",
  boCheckJWT(),
  getDepartements,
  hebergementController.getByDepartements,
);

router.get(
  "/extract/",
  boCheckJWT(),
  getDepartements,
  hebergementController.getExtract,
);
router.get(
  "/:id",
  checkJWT(),
  checkPermissionHebergement,
  requestValidatorMiddleware(HebergementRoutesSchema["GetOne"]),
  hebergementController.getById,
);
router.get(
  "/admin/:id",
  boCheckJWT(),
  checkStatutHebergement(HebergementHelper.statuts.ACTIF),
  requestValidatorMiddleware(HebergementRoutesSchema["GetOneAdmin"]),
  hebergementController.getById,
);
router.get("/siren/:siren", checkJWT(), hebergementController.getBySiren);
router.get("/", checkJWT(), hebergementController.get);
router.post("/", checkJWT(), hebergementController.post);
router.post("/brouillon", checkJWT(), hebergementController.postBrouillon);
router.put(
  "/:id/brouillon",
  checkJWT(),
  checkStatutHebergement(HebergementHelper.statuts.BROUILLON),
  hebergementController.updateBrouillon,
);
router.put(
  "/:id/activate",
  checkJWT(),
  checkStatutHebergement(HebergementHelper.statuts.BROUILLON),
  hebergementController.activate,
);
router.put(
  "/:id/desactivate",
  checkJWT(),
  checkStatutHebergement(HebergementHelper.statuts.ACTIF),
  checkPermissionHebergementUser,
  hebergementController.desactivate,
);
router.put(
  "/:id/reactivate",
  checkJWT(),
  checkStatutHebergement(HebergementHelper.statuts.DESACTIVE),
  checkPermissionHebergementUser,
  hebergementController.reactivate,
);

router.post(
  "/:id",
  checkJWT(),
  checkStatutHebergement(HebergementHelper.statuts.ACTIF),
  checkPermissionHebergement,
  hebergementController.update,
);

export default router;
