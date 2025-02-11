const express = require("express");

const router = express.Router();

const checkJWT = require("../middlewares/checkJWT");
const userController = require("../controllers/user");
const trackFoUser = require("../middlewares/trackFoUser");
const { actions, userTypes } = require("../services/Tracking");

// Gère une connexion via mot de passe.
router.get("/me", checkJWT, userController.getMe);
router.patch(
  "/me",
  checkJWT,
  trackFoUser({ action: actions.modification, userType: userTypes.front }),
  userController.patchMe,
);

module.exports = router;
