import { ERRORS_LOGIN, FeatureFlagName, UserDto } from "@vao/shared-bridge";
import type { NextFunction, Response } from "express";

import config from "../../../config";
import { schema } from "../../../helpers/schema";
import { status } from "../../../helpers/users";
import User from "../../../services/BoUser";
import Session from "../../../services/common/Session";
import CommonUser from "../../../services/common/Users";
import { FeatureFlagService } from "../../../services/featureFlagService";
import { UserRequest } from "../../../types/request";
import { signAccessToken, signRefreshToken } from "../../../utils/bo-token";
import AppError from "../../../utils/error";
import logger from "../../../utils/logger";

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

  log.d({ user });
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
    const accessToken = signAccessToken({ ...user, id: Number(user.id) });
    const refreshToken = signRefreshToken({ ...user, id: Number(user.id) });

    await Session.create(user.id, refreshToken, schema.BACK);

    res.cookie("VAO_BO_access_token", accessToken, {
      httpOnly: true,
      maxAge: config.accessToken.expiresIn,
      sameSite: "strict",
      secure: true,
    });

    res.cookie("VAO_BO_refresh_token", refreshToken, {
      httpOnly: true,
      maxAge: config.refreshToken.expiresIn,
      sameSite: "strict",
      secure: true,
    });

    log.i("DONE");

    const featureFlags = await FeatureFlagService.getFeatureFlagsAvailable();
    const requires2FA = await FeatureFlagService.isFeatureAvailable(
      FeatureFlagName.AUTH_2FA,
    );
    return res.json({ user: { ...user, featureFlags, requires2FA } });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
}
