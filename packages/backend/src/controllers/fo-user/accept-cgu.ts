import type { NextFunction, Response } from "express";

import config from "../../config";
import { schema } from "../../helpers/schema";
import Session from "../../services/common/Session";
import CommonUserService from "../../services/common/Users";
import { UserRequest } from "../../types/request";
import AppError from "../../utils/error";
import logger from "../../utils/logger";
import { signAccessToken, signRefreshToken } from "../../utils/token";

const log = logger(module.filename);

export default async function acceptCgu(
  req: UserRequest,
  res: Response,
  next: NextFunction,
) {
  console.log("Accept CGU called");
  const user = req.decoded;
  log.i("IN", { user });
  if (!user) {
    log.w("Paramètes manquants");
    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 403,
      }),
    );
  }

  try {
    await CommonUserService.acceptCgu({
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
    const accessToken = signAccessToken({ ...user, id: Number(user.id) });
    const refreshToken = signRefreshToken({ ...user, id: Number(user.id) });

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
