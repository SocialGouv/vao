const express = require("express");

const router = express.Router();

const authenticationController = require("../controllers/authentication");

// Gère une connexion via mot de passe.
router.post("/email/register", authenticationController.email.register);
router.post("/email/login", authenticationController.email.login);
router.post("/email/validate", authenticationController.email.validate);
router.post("/email/renew-token", authenticationController.email.renewToken);
router.post(
  "/email/forgotten-password",
  authenticationController.email.forgottenPassword,
);
router.post(
  "/email/renew-password",
  authenticationController.email.renewPassword,
);

router.post("/disconnect", authenticationController.disconnect);

module.exports = router;
