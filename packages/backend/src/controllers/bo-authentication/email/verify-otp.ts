import { UserAdminRoutes } from "@vao/shared-bridge";
import type { NextFunction } from "express";

import { UsersService } from "../../../admin/users/users.service";
import type { RouteRequest, RouteResponse } from "../../../types/request";
import { logger } from "../../../utils/logger";

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
      // rememberDevice: Boolean(req.body.rememberDevice),
    });
  } catch (error) {
    log.w("Erreur lors de la vérification du code OTP", { error });
    return next(error);
  }
  return res.json({ verified: true });
}
