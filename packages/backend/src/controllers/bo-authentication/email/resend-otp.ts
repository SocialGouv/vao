import { UserAdminRoutes } from "@vao/shared-bridge";
import type { NextFunction } from "express";

import { UsersService } from "../../../admin/users/users.service";
import type { RouteRequest, RouteResponse } from "../../../types/request";
import { logger } from "../../../utils/logger";

const log = logger(module.filename);

export default async function resendOtp(
  req: RouteRequest<UserAdminRoutes["ResendOtp"]>,
  res: RouteResponse<UserAdminRoutes["ResendOtp"]>,
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
