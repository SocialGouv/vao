import { ERRORS_LOGIN, USER_TARGET, UserDto } from "@vao/shared-bridge";
import type { NextFunction, Response } from "express";

import { UsersService } from "../../../admin/users/users.service";
import { schema } from "../../../helpers/schema";
import { status } from "../../../helpers/users";
import User from "../../../services/BoUser";
import CommonUser from "../../../services/common/Users";
import { UserRequest } from "../../../types/request";
import AppError from "../../../utils/error";
import { logger } from "../../../utils/logger";
import connected from "../../common/authentication/connected";
import { checkActionsOtp } from "../../common/authentication/email/login";

const log = logger(module.filename);

const target = USER_TARGET.BO;

export default async function login(
  req: UserRequest,
  res: Response,
  next: NextFunction,
) {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };
  log.i("IN", { email });
  if (!email || !password) {
    log.w("Paramètes manquants");
    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }

  let user: UserDto;
  try {
    const verifAttempt = await CommonUser.verifyLoginAttempt(
      email,
      schema.BACK,
    );
    if (verifAttempt) {
      log.w("Trop de tentatives de connexion");
      return next(
        new AppError("Trop de tentatives de connexion", {
          name: ERRORS_LOGIN.TooManyLoginAttempts,
          statusCode: 429,
        }),
      );
    }
    user = await User.login({ email, password });
  } catch (error) {
    return next(error);
  }

  if (!user) {
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",").shift() || // Si derrière un proxy
      req.socket?.remoteAddress || // Sinon, l'IP directe
      null;
    await CommonUser.recordLoginAttempt(email, ip, schema.BACK);
    log.w("Utilisateur BO inexistant");
    return next(
      new AppError("Mauvais identifiants", {
        name: ERRORS_LOGIN.WrongCredentials,
        statusCode: 404,
      }),
    );
  }

  log.d("user", user);
  // @ts-expect-error FIXME statusCode n'existe pas dans la requête sql
  if (user.statusCode === status.NEED_EMAIL_VALIDATION) {
    log.w("Compte non validé");
    return next(
      new AppError("Compte non validé", {
        name: ERRORS_LOGIN.NeedEmailValidation,
        statusCode: 400,
      }),
    );
  }

  try {
    let otpAttempts = user?.otpAttempts;
    let otpAttemptsAt = user?.otpAttemptsAt;
    let otpCodeExpiresAt = user?.otpCodeExpiresAt;
    const { featureFlags, isUpdateOtpNecessary, requires2FA } =
      await checkActionsOtp({ req, target, user });

    if (isUpdateOtpNecessary) {
      ({ otpAttempts, otpAttemptsAt, otpCodeExpiresAt } =
        await UsersService.updateOtp({
          userId: Number(user.id),
        }));
    } else {
      if (!requires2FA) {
        await connected({ rememberDevice: false, req, res, target, user });
      }
    }
    log.i("DONE");
    return res.json({
      user: {
        ...user,
        featureFlags,
        otpAttempts,
        otpAttemptsAt,
        otpCodeExpiresAt,
        requires2FA,
      },
    });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
}
