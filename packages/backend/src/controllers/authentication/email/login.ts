import { ERRORS_LOGIN, USER_TARGET } from "@vao/shared-bridge";
import type { NextFunction, Response } from "express";

import { schema } from "../../../helpers/schema";
import { status } from "../../../helpers/users";
import CommonUser from "../../../services/common/Users";
import User from "../../../services/User";
import { UserRequest } from "../../../types/request";
import { UsersService } from "../../../usagers/users/users.service";
import AppError from "../../../utils/error";
import { logger } from "../../../utils/logger";
import connected from "../../common/authentication/connected";
import { checkActionsOtp } from "../../common/authentication/email/login";

const log = logger(module.filename);
const target = USER_TARGET.FO;

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

  try {
    const verifAttempt = await CommonUser.verifyLoginAttempt(
      email,
      schema.FRONT,
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

    const user = await User.login({
      email,
      password,
    });
    if (!user) {
      log.w("Utilisateur inexistant");
      const ip =
        (req.headers["x-forwarded-for"] as string | undefined)
          ?.split(",")
          .shift() || // Si derrière un proxy
        req.socket?.remoteAddress || // Sinon, l'IP directe
        null;
      await CommonUser.recordLoginAttempt(email, ip, schema.FRONT);
      return next(
        new AppError("Mauvais identifiants", {
          name: "WrongCredentials",
          statusCode: 404,
        }),
      );
    }

    log.d("user", { user });
    if (
      user.statusCode === status.NEED_EMAIL_VALIDATION ||
      user.statusCode === status.NEED_SIRET_VALIDATION
    ) {
      log.w("Compte non validé");
      return next(
        new AppError("Compte inactif", {
          name: "NeedEmailValidation",
          statusCode: 400,
        }),
      );
    }
    if (user.statusCode === status.BLOCKED) {
      log.w("Compte bloqué");
      return next(
        new AppError("Compte bloqué", {
          name: "EmailUnauthorized",
          statusCode: 400,
        }),
      );
    }
    if (user.statusCode === status.TEMPORARY_BLOCKED) {
      log.w("Compte temporairement bloqué");
      return next(
        new AppError(
          "Votre compte est temporairement bloqué. Veuillez réinitialiser votre mot de passe pour le réactiver.",
          {
            name: "UserTemporarilyBlocked",
            statusCode: 400,
          },
        ),
      );
    }
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
