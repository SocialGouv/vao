const express = require("express");

const router = express.Router();

const territoireController = require("../controllers/territoire");
const BOcheckJWT = require("../middlewares/bo-check-JWT");

router.get("/list", BOcheckJWT, territoireController.list);
router.get("/get-one/:idTerritoire", BOcheckJWT, territoireController.getOne);
router.get(
  "/get-fiche-id-by-ter-code/:territoireCode",
  BOcheckJWT,
  territoireController.getFicheIdByTerCode,
);
router.put("/:id", BOcheckJWT, territoireController.update);

module.exports = router;
