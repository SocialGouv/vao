const express = require("express");

const router = express.Router();

const checkJWT = require("../middlewares/checkJWT");
const demandeSejourController = require("../controllers/demandeSejour");

// Gère une connexion via mot de passe.
router.get("/admin", demandeSejourController.getByAdminId);
router.get("/:id", checkJWT, demandeSejourController.getById);
router.get("/", checkJWT, demandeSejourController.get);
router.post("/depose/:id", checkJWT, demandeSejourController.depose);
router.post("/:id", checkJWT, demandeSejourController.update);
router.post("/", checkJWT, demandeSejourController.post);

module.exports = router;
