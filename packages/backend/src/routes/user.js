const express = require("express");

const router = express.Router();

const checkJWT = require("../middlewares/checkJWT");
const userController = require("../controllers/user");
const trackFoUser = require("../middlewares/trackFoUser");
const { actions, userTypes } = require("../helpers/tracking");

// Gère une connexion via mot de passe.
router.get("/me", checkJWT, userController.getMe);
router.patch(
  "/me",
  checkJWT,
  trackFoUser({ action: actions.modification, userType: userTypes.front }),
  userController.patchMe,
);
router.post("/generate-api-token", checkJWT, userController.generateApiToken);
router.get("/api-token", checkJWT, userController.getApiToken);

module.exports = router;
