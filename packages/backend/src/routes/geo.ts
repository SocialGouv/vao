import express from "express";

import { geoController } from "../controllers";

const router = express.Router();

// Gère une connexion via mot de passe.
router.get("/communes", geoController.commune.fetch);
router.get("/communes/:communeCode", geoController.commune.get);
router.get("/departements", geoController.departement.fetch);
router.get("/regions", geoController.region.fetch);
router.post("/adresse", geoController.adresse.fetch);
router.get("/check-api-adresse", geoController.checkApiAdresse);

export default router;
