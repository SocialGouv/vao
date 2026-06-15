import { UserUsagersRoutesSchema } from "@vao/shared-bridge";
import express from "express";

import { authenticationController } from "../controllers";
import checkJWT from "../middlewares/checkJWT";
import { requestValidatorMiddleware } from "../middlewares/requestValidatorMiddleware";
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
  "/email/verify-otp",
  requestValidatorMiddleware(UserUsagersRoutesSchema["VerifyOtp"]),
  authenticationController.email.verifyOtp,
);
router.post(
  "/email/resend-otp",
  requestValidatorMiddleware(UserUsagersRoutesSchema["ResendOtp"]),
  authenticationController.email.resendOtp,
);
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
