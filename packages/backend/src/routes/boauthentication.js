const express = require("express");

const router = express.Router();

const BOAuthenticationController = require("../controllers/bo-authentication");

// Gère une connexion via mot de passe.
router.post("/email/register", BOAuthenticationController.email.register);
router.post("/email/login", BOAuthenticationController.email.login);
router.post("/email/validate", BOAuthenticationController.email.validate);
router.post("/email/renewToken", BOAuthenticationController.email.renewToken);
router.post(
  "/email/forgotten-password",
  BOAuthenticationController.email.forgottenPassword,
);
router.post(
  "/email/renewPassword",
  BOAuthenticationController.email.renewPassword,
);

router.post("/disconnect", BOAuthenticationController.disconnect);

module.exports = router;
