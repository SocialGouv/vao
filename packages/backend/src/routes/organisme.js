const express = require("express");

const router = express.Router();

const checkJWT = require("../middlewares/checkJWT");
const BOcheckJWT = require("../middlewares/bo-check-JWT");
const organismeController = require("../controllers/organisme");

router.get("/bo/liste", BOcheckJWT, organismeController.getAll);
router.get(
  "/bo/:organismeId",
  BOcheckJWT,
  organismeController.getByOrganismeId,
);
router.get("/", checkJWT, organismeController.getMine);
router.get("/siret/:siret", checkJWT, organismeController.getBySiret);
router.get("/:organismeId", checkJWT, organismeController.getByOrganismeId);
router.post("/:organismeId", checkJWT, organismeController.update);
router.post("/:organismeId/finalize", checkJWT, organismeController.finalize);
router.post("/", checkJWT, organismeController.post);

module.exports = router;
