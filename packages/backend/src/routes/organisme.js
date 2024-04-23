const express = require("express");

const router = express.Router();

const checkJWT = require("../middlewares/checkJWT");
const organismeController = require("../controllers/organisme");

// Gère une connexion via mot de passe.
router.get("/", checkJWT, organismeController.getMine);
router.get("/siret/:siret", checkJWT, organismeController.getBySiret);
router.get("/:organismeId", checkJWT, organismeController.getByOrganismeId);
router.post("/:organismeId", checkJWT, organismeController.update);
router.post("/:organismeId/finalize", checkJWT, organismeController.finalize);
router.post("/", checkJWT, organismeController.post);

module.exports = router;
