import express from "express";

import { authenticationController } from "../controllers";
import checkJWT from "../middlewares/checkJWT";
import { logger } from "../utils/logger";

const log = logger(module.filename);

const router = express.Router();

// Gère une connexion via mot de passe.
router.get("/check-token", checkJWT, (req, res) => {
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

export default router;
