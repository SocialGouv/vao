import { HebergementUsagersRoutesSchema } from "@vao/shared-bridge";
import express from "express";

import checkJWT from "../../middlewares/checkJWT";
import { requestValidatorMiddleware } from "../../middlewares/requestValidatorMiddleware";
import { HebergementController } from "./hebergements.controller";

const router = express.Router();

router.post(
  "/site/similarites",
  checkJWT,
  requestValidatorMiddleware(
    HebergementUsagersRoutesSchema["CheckSimilarites"],
  ),
  HebergementController.checkSimilarites,
);

export default router;
