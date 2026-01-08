import type { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";

import config from "../../config";
import { schema } from "../../helpers/schema";
import Session from "../../services/common/Session";
import CommonUser from "../../services/common/Users";
import { UserRequest } from "../../types/request";
import { buildAccessToken, buildRefreshToken } from "../../utils/bo-token";
import AppError from "../../utils/error";
import logger from "../../utils/logger";

const log = logger(module.filename);

export default async function acceptCgu(
  req: UserRequest,
  res: Response,
  next: NextFunction,
) {
  const user = req.decoded;
  log.i("IN", { user });
  if (!user) {
    log.w("Paramètes manquants");
    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }

  try {
    await CommonUser.acceptCgu({
      userId: user.id,
      userSchema: schema.FRONT,
    });
    user.cguAccepted = true;
  } catch (error) {
    return next(error);
  }

  try {
    if (!config.tokenSecret_FO) {
      throw new Error("tokenSecret_FO is not defined in config");
    }
    const accessToken = jwt.sign(
      buildAccessToken(user),
      config.tokenSecret_FO as string,
      {
        algorithm: config.algorithm as jwt.Algorithm,
        expiresIn: Math.floor(config.accessToken.expiresIn / 1000), // Le délai avant expiration exprimé en seconde
      },
    );

    const refreshToken = jwt.sign(
      buildRefreshToken(user),
      config.tokenSecret_FO as string,
      {
        algorithm: config.algorithm as jwt.Algorithm,
        expiresIn: Math.floor(config.refreshToken.expiresIn / 1000),
      },
    );

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

    log.i("DONE");

    return res.json({ user });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
}
