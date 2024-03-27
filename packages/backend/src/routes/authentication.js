const express = require("express");
const checkJWT = require("../middlewares/checkJWT");
const BOcheckJWT = require("../middlewares/bo-check-JWT");

const logger = require("../utils/logger");

const log = logger(module.filename);

const router = express.Router();

const authenticationController = require("../controllers/authentication");

// Gère une connexion via mot de passe.
router.get("/check-token", checkJWT, (req, res) => {
  log.d("check token is OK! ");
  res.send("OK");
});
router.get("/bo/check-token", BOcheckJWT, (req, res) => {
  log.d("check token is OK! ");
  res.send("OK");
});
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
