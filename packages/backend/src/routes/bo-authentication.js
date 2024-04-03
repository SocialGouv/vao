const express = require("express");
const BOAuthenticationController = require("../controllers/bo-authentication");
const BOcheckJWT = require("../middlewares/bo-check-JWT");
const logger = require("../utils/logger");

const router = express.Router();
const log = logger(module.filename);

router.get("/check-token", BOcheckJWT, (req, res) => {
  log.d("check token is OK! ");
  res.send("OK");
});
// Gère une connexion via mot de passe.
router.post("/email/register", BOAuthenticationController.email.register);
router.post("/email/login", BOAuthenticationController.email.login);
router.post("/email/validate", BOAuthenticationController.email.validate);
router.post("/email/renew-token", BOAuthenticationController.email.renewToken);
router.post(
  "/email/forgotten-password",
  BOAuthenticationController.email.forgottenPassword,
);
router.post(
  "/email/renew-password",
  BOAuthenticationController.email.renewPassword,
);

router.post("/disconnect", BOAuthenticationController.disconnect);

module.exports = router;
