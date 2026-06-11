import { UserUsagersRoutes } from "@vao/shared-bridge";
import type { NextFunction } from "express";

import type { RouteRequest, RouteResponse } from "../../../types/request";
import { UsersService } from "../../../usagers/users/users.service";
import { logger } from "../../../utils/logger";

const log = logger(module.filename);

export default async function resendOtp(
  req: RouteRequest<UserUsagersRoutes["ResendOtp"]>,
  res: RouteResponse<UserUsagersRoutes["ResendOtp"]>,
  next: NextFunction,
) {
  try {
    await UsersService.resendOtpCode({
      email: req.body.email,
    });
  } catch (error) {
    log.w("Erreur lors du renvoi du code OTP", { error });
    return next(error);
  }
  return res.json({ success: true });
}
