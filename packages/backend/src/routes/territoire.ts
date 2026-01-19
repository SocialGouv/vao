import express from "express";

import territoireController from "../controllers/territoire";
import BOcheckJWT from "../middlewares/bo-check-JWT";
import checkJWT from "../middlewares/checkJWT";

const router = express.Router();

router.get(
  "/get-by-agrement-region-user",
  checkJWT,
  territoireController.getFicheByAgrementRegionUser,
);
router.get("/list", BOcheckJWT, territoireController.list);
router.get("/get-one/:idTerritoire", BOcheckJWT, territoireController.getOne);
router.get(
  "/get-fiche-id-by-ter-code/:territoireCode",
  BOcheckJWT,
  territoireController.getFicheIdByTerCode,
);
router.put("/:id", BOcheckJWT, territoireController.update);

module.exports = router;
