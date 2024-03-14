const express = require("express");

const router = express.Router();

const checkJWT = require("../middlewares/checkJWT");
const boCheckJWT = require("../middlewares/bo-check-JWT");

const demandeSejourController = require("../controllers/demandeSejour");
const getDepartements = require("../middlewares/getDepartements");

// Gère une connexion via mot de passe.
router.get(
  "/admin",
  boCheckJWT,
  getDepartements,
  demandeSejourController.getByAdminId,
);
router.get(
  "/admin/:id",
  boCheckJWT,
  getDepartements,
  demandeSejourController.getByIdBo,
);
router.get("/:id", checkJWT, demandeSejourController.getById);
router.get("/", checkJWT, demandeSejourController.get);
router.post("/depose/:id", checkJWT, demandeSejourController.depose);
router.post("/:id", checkJWT, demandeSejourController.update);
router.post("/", checkJWT, demandeSejourController.post);

module.exports = router;
