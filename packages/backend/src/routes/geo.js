const express = require("express");

const router = express.Router();

const geoController = require("../controllers/geo");

// Gère une connexion via mot de passe.
router.get("/pays", geoController.pays.fetch);
router.get("/pays/:paysCode", geoController.pays.get);
router.get("/communes", geoController.commune.fetch);
router.get("/communes/:communeCode", geoController.commune.get);
router.get("/departements", geoController.departement.fetch);
router.get("/regions", geoController.region.fetch);
router.post("/adresse", geoController.adresse.fetch);

module.exports = router;
