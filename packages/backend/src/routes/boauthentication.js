const express = require("express");

const router = express.Router();

const boauthenticationController = require("../controllers/bo/authentication");

// Gère une connexion via mot de passe.
router.post("/email/register", boauthenticationController.email.register);
router.post("/email/login", boauthenticationController.email.login);
router.post("/email/validate", boauthenticationController.email.validate);
router.post("/email/renewToken", boauthenticationController.email.renewToken);
router.post(
  "/email/forgotten-password",
  boauthenticationController.email.forgottenPassword,
);
router.post(
  "/email/renewPassword",
  boauthenticationController.email.renewPassword,
);

router.post("/disconnect", boauthenticationController.disconnect);

module.exports = router;
