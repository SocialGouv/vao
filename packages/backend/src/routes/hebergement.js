const express = require("express");

const router = express.Router();

const checkJWT = require("../middlewares/checkJWT");
const boCheckJWT = require("../middlewares/bo-check-JWT");
const hebergementController = require("../controllers/hebergement");

// Gère une connexion via mot de passe.
router.get("/:id", checkJWT, hebergementController.getById);
router.get("/admin/:id", boCheckJWT, hebergementController.getById);
router.get("/", checkJWT, hebergementController.get);
router.post("/", checkJWT, hebergementController.post);
router.post("/:id", checkJWT, hebergementController.update);

module.exports = router;
