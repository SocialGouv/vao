import { USER_TARGET, UserAdminRoutes } from "@vao/shared-bridge";
import type { NextFunction } from "express";

import { UsersService } from "../../../admin/users/users.service";
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
    const user = await UsersService.verifyOtpCode({
      code: req.body.code,
      email: req.body.email,
    });
    await connected({
      rememberDevice: req.validatedBody!.rememberDevice,
      req,
      res,
      target: USER_TARGET.BO,
      user,
    });
    return res.json({ user });
  } catch (error) {
    log.w("Erreur lors de la vérification du code OTP", { error });
    return next(error);
  }
}
