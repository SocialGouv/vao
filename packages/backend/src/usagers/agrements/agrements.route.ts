import express from "express";

import checkJWT from "../../middlewares/checkJWT";
import checkPermissionAgrement from "../../middlewares/checkPermissionAgrement";
import { AgrementController } from "./agrements.controller";

const router = express.Router();

router.get(
  "/organisme/:id",
  checkJWT,
  checkPermissionAgrement,
  AgrementController.get,
);

router.post("/", checkJWT, checkPermissionAgrement, AgrementController.post);

export default router;
