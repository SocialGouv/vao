import express from "express";

import { e2eController } from "../controllers";

const router = express.Router();

router.post("/reset", e2eController.resetE2e);

export default router;
