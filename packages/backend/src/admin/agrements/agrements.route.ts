import { AgrementAdminRoutesSchema } from "@vao/shared-bridge";
import express from "express";

import boCheckJWT from "../../middlewares/bo-check-JWT";
import checkPermissionBOAgrement from "../../middlewares/checkPermissionBOAgrement";
import { requestValidatorMiddleware } from "../../middlewares/requestValidatorMiddleware";
import { AgrementController } from "./agrements.controller";

const router = express.Router();

router.get(
  "/list/",
  boCheckJWT,
  requestValidatorMiddleware(AgrementAdminRoutesSchema["GetList"]),
  checkPermissionBOAgrement,
  AgrementController.getList,
);

export default router;
