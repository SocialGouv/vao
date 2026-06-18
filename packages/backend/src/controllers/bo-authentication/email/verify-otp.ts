import { USER_TARGET, UserAdminRoutes } from "@vao/shared-bridge";
import type { NextFunction } from "express";

import { UsersService } from "../../../admin/users/users.service";
import { readOneByMail } from "../../../services/BoUser";
import { FeatureFlagService } from "../../../services/featureFlagService";
import type { RouteRequest, RouteResponse } from "../../../types/request";
import { logger } from "../../../utils/logger";
import connected from "../../common/authentication/connected";

const log = logger(module.filename);

export default async function verifyOtp(
  req: RouteRequest<UserAdminRoutes["VerifyOtp"]>,
  res: RouteResponse<UserAdminRoutes["VerifyOtp"]>,
  next: NextFunction,
) {
  try {
    await UsersService.verifyOtpCode({
      code: req.body.code,
      email: req.body.email,
    });
    const user = await readOneByMail(req.body.email);
    await connected({
      rememberDevice: req.validatedBody!.rememberDevice,
      req,
      res,
      target: USER_TARGET.BO,
      user,
    });
    const featureFlags = await FeatureFlagService.getFeatureFlagsAvailable();
    return res.json({ user: { ...user, featureFlags } });
  } catch (error) {
    log.w("Erreur lors de la vérification du code OTP", { error });
    return next(error);
  }
}
