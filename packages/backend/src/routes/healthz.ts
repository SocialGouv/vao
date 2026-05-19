import { NextFunction, Request, Response, Router } from "express";

import { healthz } from "../services/Healthz";

const router = Router();

router.get(
  "/",
  async function mainHandler(_req: Request, res: Response, next: NextFunction) {
    try {
      await healthz();
    } catch (err) {
      next(err);
    }
    return res.status(200).json({ status: "ok" });
  },
);

export default router;
