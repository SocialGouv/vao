import express from "express";

import {
  getFicheByAgrementRegionUser,
  getFicheIdByTerCode,
  getOne,
  list,
  update,
} from "../controllers/territoire";
import BOcheckJWT from "../middlewares/bo-check-JWT";
import checkJWT from "../middlewares/checkJWT";

const router = express.Router();

router.get(
  "/get-by-agrement-region-user",
  checkJWT,
  getFicheByAgrementRegionUser,
);
router.get("/list", BOcheckJWT, list);
router.get("/get-one/:idTerritoire", BOcheckJWT, getOne);
router.get(
  "/get-fiche-id-by-ter-code/:territoireCode",
  BOcheckJWT,
  getFicheIdByTerCode,
);
router.put("/:id", BOcheckJWT, update);

module.exports = router;
