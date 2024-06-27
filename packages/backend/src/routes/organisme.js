const express = require("express");

const router = express.Router();

const checkJWT = require("../middlewares/checkJWT");
const BOcheckJWT = require("../middlewares/bo-check-JWT");
const checkComingFrom = require("../middlewares/checkComingFrom");
const organismeController = require("../controllers/organisme");

router.get("/bo/liste", BOcheckJWT, organismeController.getAll);
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
  checkComingFrom,
  organismeController.getByOrganismeId,
);
router.get("/", checkJWT, organismeController.getMine);
router.post("/:organismeId", checkJWT, organismeController.update);
router.post("/:organismeId/finalize", checkJWT, organismeController.finalize);
router.post("/", checkJWT, organismeController.post);

module.exports = router;
