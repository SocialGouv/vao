const express = require("express");

const router = express.Router();

const checkJWT = require("../middlewares/checkJWT");
const operateurController = require("../controllers/operateur");

// Gère une connexion via mot de passe.
router.get("/:id", checkJWT, operateurController.getByOperateurId);
router.get("/", checkJWT, operateurController.get);
router.post("/", checkJWT, operateurController.post);

module.exports = router;
