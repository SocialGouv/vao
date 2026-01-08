const express = require("express");

const router = express.Router();

const checkJWT = require("../middlewares/checkJWT");
const userController = require("../controllers/user");
const trackFoUser = require("../middlewares/trackFoUser");
const { TRACKING_ACTIONS, TRACKING_USER_TYPE } = require("@vao/shared-bridge");

// Gère une connexion via mot de passe.
router.get("/me", checkJWT(), userController.getMe);
router.patch(
  "/me",
  checkJWT(),
  trackFoUser({
    action: TRACKING_ACTIONS.modification,
    userType: TRACKING_USER_TYPE.front,
  }),
  userController.patchMe,
);
router.post("/generate-api-token", checkJWT(), userController.generateApiToken);
router.get("/api-token", checkJWT(), userController.getApiToken);

module.exports = router;
