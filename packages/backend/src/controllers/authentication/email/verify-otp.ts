import { UserUsagersRoutes } from "@vao/shared-bridge";
import type { NextFunction } from "express";

import type { RouteRequest, RouteResponse } from "../../../types/request";
import { UsersService } from "../../../usagers/users/users.service";
import { logger } from "../../../utils/logger";

const log = logger(module.filename);

export default async function verifyOtp(
  req: RouteRequest<UserUsagersRoutes["VerifyOtp"]>,
  res: RouteResponse<UserUsagersRoutes["VerifyOtp"]>,
  next: NextFunction,
) {
  try {
    await UsersService.verifyOtpCode({
      code: req.body.code,
      email: req.body.email,
      // rememberDevice: Boolean(req.body.rememberDevice),
    });
  } catch (error) {
    log.w("Erreur lors de la vérification du code OTP", { error });
    return next(error);
  }
  return res.json({ verified: true });
}
