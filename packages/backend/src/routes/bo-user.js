const express = require("express");

const router = express.Router();

const BOcheckJWT = require("../middlewares/bo-check-JWT");
const BOUserController = require("../controllers/bo-user");

// Gère une connexion via mot de passe.
router.get("/me", BOcheckJWT, BOUserController.getMe);

module.exports = router;
