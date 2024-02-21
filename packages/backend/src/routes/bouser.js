const express = require("express");

const router = express.Router();

const checkJWT = require("../middlewares/checkJWT");
const bouserController = require("../controllers/bo/user");

// Gère une connexion via mot de passe.
router.get("/me", checkJWT, bouserController.getMe);

module.exports = router;
