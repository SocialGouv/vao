import express from "express";

import { resetE2e } from "../controllers/e2e";

const router = express.Router();

router.post("/reset", resetE2e);

export default router;
