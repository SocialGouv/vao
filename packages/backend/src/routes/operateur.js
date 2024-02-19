const express = require("express");

const router = express.Router();

const checkJWT = require("../middlewares/checkJWT");
const operateurController = require("../controllers/operateur");

// Gère une connexion via mot de passe.
router.get("/", checkJWT, operateurController.getMine);
router.get("/siret/:siret", checkJWT, operateurController.getBySiret);
router.get("/siege/:siret", checkJWT, operateurController.getSiege);
router.get("/:id", checkJWT, operateurController.getByOperateurId);
router.post("/:id", checkJWT, operateurController.update);
router.post("/", checkJWT, operateurController.post);

module.exports = router;
