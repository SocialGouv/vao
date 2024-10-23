const express = require("express");

const router = express.Router();

const checkJWT = require("../middlewares/checkJWT");
const userController = require("../controllers/user");

// Gère une connexion via mot de passe.
router.get("/me", checkJWT, userController.getMe);
router.patch("/me", checkJWT, userController.patchMe);

module.exports = router;
