import { ERRORS_LOGIN, FeatureFlagName } from "@vao/shared-bridge";
import type { NextFunction, Response } from "express";

import { config } from "../../../config";
import { schema } from "../../../helpers/schema";
import { status } from "../../../helpers/users";
import Session from "../../../services/common/Session";
import CommonUser from "../../../services/common/Users";
import { FeatureFlagService } from "../../../services/featureFlagService";
import User from "../../../services/User";
import { UserRequest } from "../../../types/request";
import { UsersService } from "../../../usagers/users/users.service";
import AppError from "../../../utils/error";
import { logger } from "../../../utils/logger";
import { OtpService } from "../../../utils/otp";
import { signAccessToken, signRefreshToken } from "../../../utils/token";

const log = logger(module.filename);

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

    const featureFlags = await FeatureFlagService.getFeatureFlagsAvailable();
    const requires2FA = await FeatureFlagService.isFeatureAvailable(
      FeatureFlagName.AUTH_2FA,
    );
    if (requires2FA) {
      const { isLocked } = OtpService.isLocked({
        otpAttempts: user.otpAttempts ?? 0,
        otpAttemptsAt: user.otpAttemptsAt ?? null,
      });
      const isExpired = OtpService.isExpired({
        otpCodeExpiresAt: user.otpCodeExpiresAt ?? null,
      });
      if (!isLocked) {
        if (isExpired) {
          await UsersService.updateOtpCode({
            userId: Number(user.id),
          });
        }
      }
    } else {
      const accessToken = signAccessToken(user);
      const refreshToken = signRefreshToken(user);

      await Session.clean({ id: user.id }, schema.FRONT);
      await Session.create(user.id, refreshToken, schema.FRONT);

      res.cookie("VAO_access_token", accessToken, {
        httpOnly: true,
        maxAge: config.accessToken.expiresIn,
        sameSite: "strict",
        secure: true,
      });

      res.cookie("VAO_refresh_token", refreshToken, {
        httpOnly: true,
        maxAge: config.refreshToken.expiresIn,
        sameSite: "strict",
        secure: true,
      });
    }
    log.i("DONE");

    return res.json({ user: { ...user, featureFlags, requires2FA } });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
}
