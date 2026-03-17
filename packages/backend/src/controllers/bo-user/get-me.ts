import type { NextFunction, Response } from "express";

import User from "../../services/BoUser";
import { FeatureFlagService } from "../../services/featureFlagService";
import { UserRequest } from "../../types/request";
import logger from "../../utils/logger";

const log = logger(module.filename);

async function getMe(req: UserRequest, res: Response, next: NextFunction) {
  try {
    const { decoded } = req;
    log.i("IN");
    const user = await User.readOne(decoded!.id);
    log.i("DONE", { user });
    const featureFlags = await FeatureFlagService.getFeatureFlagsAvailable();
    return res.json({ user: { ...user, featureFlags } });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
}

export default getMe;
