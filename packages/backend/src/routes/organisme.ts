import express from "express";

import { organismeController } from "../controllers";
import BOcheckJWT from "../middlewares/bo-check-JWT";
import checkComingFrom from "../middlewares/checkComingFrom";
import checkJWT from "../middlewares/checkJWT";
import checkPermissionOrganisme from "../middlewares/checkPermissionOrganisme";

const router = express.Router();

router.get("/bo/liste", BOcheckJWT, organismeController.getListe);
router.get("/bo/extract", BOcheckJWT, organismeController.getListeExtract);
router.get("/bo/nonagrees", BOcheckJWT, organismeController.getNonAgrees);
router.get(
  "/bo/:organismeId",
  BOcheckJWT,
  checkComingFrom,
  organismeController.getByOrganismeId,
);
router.get("/siret/:siret", checkJWT, organismeController.getBySiret);
router.get(
  "/:organismeId",
  checkJWT,
  checkPermissionOrganisme,
  checkComingFrom,
  organismeController.getByOrganismeId,
);
router.get("/", checkJWT, organismeController.getMine);
router.post(
  "/:organismeId",
  checkJWT,
  checkPermissionOrganisme,
  organismeController.update,
);
router.post(
  "/:organismeId/finalize",
  checkJWT,
  checkPermissionOrganisme,
  organismeController.finalize,
);
router.post("/", checkJWT, organismeController.post);

export default router;
