const express = require("express");

const router = express.Router();

const checkJWT = require("../middlewares/checkJWT");
const BOcheckJWT = require("../middlewares/bo-check-JWT");
const checkPermissionOrganisme = require("../middlewares/checkPermissionOrganisme");
const checkComingFrom = require("../middlewares/checkComingFrom");
const organismeController = require("../controllers/organisme");

router.get("/bo/liste", BOcheckJWT(), organismeController.getListe);
router.get("/bo/extract", BOcheckJWT(), organismeController.getListeExtract);
router.get("/bo/nonagrees", BOcheckJWT(), organismeController.getNonAgrees);
router.get(
  "/bo/:organismeId",
  BOcheckJWT(),
  checkComingFrom,
  organismeController.getByOrganismeId,
);
router.get("/siret/:siret", checkJWT(), organismeController.getBySiret);
router.get(
  "/:organismeId",
  checkJWT(),
  checkPermissionOrganisme,
  checkComingFrom,
  organismeController.getByOrganismeId,
);
router.get("/", checkJWT(), organismeController.getMine);
router.post(
  "/:organismeId",
  checkJWT(),
  checkPermissionOrganisme,
  organismeController.update,
);
router.post(
  "/:organismeId/finalize",
  checkJWT(),
  checkPermissionOrganisme,
  organismeController.finalize,
);
router.post("/", checkJWT(), organismeController.post);

module.exports = router;
