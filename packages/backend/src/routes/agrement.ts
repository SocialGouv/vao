import express from "express";

import agrementController from "../controllers/agrement";
import checkJWT from "../middlewares/checkJWT";
import checkPermissionAgrement from "../middlewares/checkPermissionAgrement";

const router = express.Router();

router.get(
  "/organisme/:id",
  checkJWT,
  checkPermissionAgrement,
  agrementController.getByOrganismeId,
);

router.post("/", checkJWT, checkPermissionAgrement, agrementController.post);

export default router;
