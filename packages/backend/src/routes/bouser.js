const express = require("express");

const router = express.Router();

const checkBOJWT = require("../middlewares/checkBOJWT");
const BOUserController = require("../controllers/bo-user");

// Gère une connexion via mot de passe.
router.get("/me", checkBOJWT, BOUserController.getMe);

module.exports = router;
