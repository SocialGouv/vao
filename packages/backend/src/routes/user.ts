import { TRACKING_ACTIONS, TRACKING_USER_TYPE } from "@vao/shared-bridge";
import express from "express";

import { userController } from "../controllers";
import checkJWT from "../middlewares/checkJWT";
import trackFoUser from "../middlewares/trackFoUser";

const router = express.Router();

// Gère une connexion via mot de passe.
router.get("/me", checkJWT, userController.getMe);
router.patch(
  "/me",
  checkJWT,
  trackFoUser({
    action: TRACKING_ACTIONS.modification,
    userType: TRACKING_USER_TYPE.front,
  }),
  userController.patchMe,
);
router.post("/generate-api-token", checkJWT, userController.generateApiToken);
router.get("/api-token", checkJWT, userController.getApiToken);

export default router;
