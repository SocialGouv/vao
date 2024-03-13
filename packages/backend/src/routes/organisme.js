const express = require("express");

const router = express.Router();

const checkJWT = require("../middlewares/checkJWT");
const organismeController = require("../controllers/organisme");

// Gère une connexion via mot de passe.
router.get("/", checkJWT, organismeController.getMine);
router.get("/siret/:siret", checkJWT, organismeController.getBySiret);
router.get("/siege/:siren", checkJWT, organismeController.getSiege);
router.get("/:id", checkJWT, organismeController.getByOrganismeId);
router.post("/:id", checkJWT, organismeController.update);
router.post("/", checkJWT, organismeController.post);

module.exports = router;
