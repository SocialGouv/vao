import type { NextFunction, Response } from "express";

import { FeatureFlagService } from "../../services/featureFlagService";
import User from "../../services/User";
import { UserRequest } from "../../types/request";
import logger from "../../utils/logger";
import normalize from "../../utils/normalize";

const log = logger(module.filename);

async function getMe(req: UserRequest, res: Response, next: NextFunction) {
  const { decoded } = req;
  log.i("IN");
  try {
    const users = await User.read({ mail: normalize(decoded!.email) });
    if (users.length === 0) {
      log.w("Utilisateur inexistant");
      return res.status(404).json({ name: "UserNotFound" });
    }
    const [user] = users;
    log.d({ user });
    const featureFlags = await FeatureFlagService.getFeatureFlagsAvailable();
    log.i("DONE");
    return res.json({ user: { ...user, featureFlags } });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
}

export default getMe;
