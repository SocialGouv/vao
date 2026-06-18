import express from "express";

import { siretController } from "../controllers";
import checkJWT from "../middlewares/checkJWT";

const router = express.Router();

router.get("/check-api-insee", siretController.checkApiInsee);
router.get("/check-api-entreprise", siretController.checkApiEntreprise);
router.get("/:siret", checkJWT, siretController.get);
router.get(
  "/get-lien-succession/:siret",
  checkJWT,
  siretController.getLienSuccession,
);

export default router;
