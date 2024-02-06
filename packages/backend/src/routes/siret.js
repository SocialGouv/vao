const express = require("express");

const router = express.Router();

const checkJWT = require("../middlewares/checkJWT");
const siretController = require("../controllers/siret");

// Gère une connexion via mot de passe.
router.get("/:siret", checkJWT, siretController.get);
module.exports = router;
