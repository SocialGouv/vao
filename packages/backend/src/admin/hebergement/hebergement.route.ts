import { HebergementAdminRoutesSchema } from "@vao/shared-bridge";
import express from "express";

import { statuts as HebergementStatuts } from "../../helpers/hebergement";
import boCheckJWT from "../../middlewares/bo-check-JWT";
import checkStatutHebergement from "../../middlewares/checkStatutHebergement";
import getDepartements from "../../middlewares/getDepartements";
import { requestValidatorMiddleware } from "../../middlewares/requestValidatorMiddleware";
import { HebergementAdminController } from "./hebergement.controller";

const router = express.Router();

router.get(
  "/",
  boCheckJWT,
  getDepartements,
  HebergementAdminController.getList,
);

router.get(
  "/extract",
  boCheckJWT,
  getDepartements,
  HebergementAdminController.getExtract,
);

router.get(
  "/:id",
  boCheckJWT,
  checkStatutHebergement(HebergementStatuts.ACTIF),
  requestValidatorMiddleware(HebergementAdminRoutesSchema["GetOne"]),
  HebergementAdminController.getOne,
);

export default router;
