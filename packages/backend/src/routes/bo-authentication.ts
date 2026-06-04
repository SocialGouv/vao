import express, { Response } from "express";

import { BOAuthenticationController } from "../controllers";
import BOcheckJWT from "../middlewares/bo-check-JWT";
import { UserRequest } from "../types/request";
import { logger } from "../utils/logger";

const log = logger(module.filename);

const router = express.Router();

router.get("/check-token", BOcheckJWT, (req: UserRequest, res: Response) => {
  log.d("check token is OK! ");
  res.send("OK");
});
// Gère une connexion via mot de passe.
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

export default router;
