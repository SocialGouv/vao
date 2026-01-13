const express = require("express");

const router = express.Router();

const checkJWT = require("../middlewares/checkJWT");
const siretController = require("../controllers/siret");

router.get("/check-api-insee", siretController.checkApiInsee);
router.get("/check-api-entreprise", siretController.checkApiEntreprise);
router.get("/:siret", checkJWT, siretController.get);
router.get(
  "/get-lien-succession/:siret",
  checkJWT,
  siretController.getLienSuccession,
);

module.exports = router;
