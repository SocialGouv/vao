import { USER_TARGET, UserAdminDto, UserUsagersDto } from "@vao/shared-bridge";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";

import { config } from "../../../config";
import { schema } from "../../../helpers/schema";
import Session from "../../../services/common/Session";
import {
  signAccessToken as signAccessTokenAdmin,
  signRefreshToken as signRefreshTokenAdmin,
} from "../../../utils/bo-token";
import {
  signAccessToken as signAccessTokenUsager,
  signRefreshToken as signRefreshTokenUsager,
} from "../../../utils/token";
import { isTrustedDevice } from "./isTrustDevice";

export default async function connected({
  req,
  res,
  user,
  target,
  rememberDevice,
}: {
  req: Request;
  res: Response;
  user: UserUsagersDto | UserAdminDto;
  target: (typeof USER_TARGET)[keyof typeof USER_TARGET];
  rememberDevice?: boolean;
}) {
  const isBo = target === USER_TARGET.BO;
  const schemaTarget = isBo ? schema.BACK : schema.FRONT;
  const userTokenPayloadUsager = {
    cguAccepted: user.cguAccepted!,
    email: user.email!,
    id: Number(user.id!),
  };
  const userTokenPayloadAdmin = {
    ...userTokenPayloadUsager,
    roles: user.roles!,
    territoireCode: (user as UserAdminDto).territoireCode!,
  };
  const accessToken = isBo
    ? signAccessTokenAdmin(userTokenPayloadAdmin)
    : signAccessTokenUsager(userTokenPayloadUsager);
  const refreshToken = isBo
    ? signRefreshTokenAdmin(userTokenPayloadAdmin)
    : signRefreshTokenUsager(userTokenPayloadUsager);

  await Session.clean({ id: user.id }, schemaTarget);
  await Session.create(user.id, refreshToken, schemaTarget);

  res.cookie(`VAO${isBo ? "_BO" : ""}_access_token`, accessToken, {
    httpOnly: true,
    maxAge: config.accessToken.expiresIn,
    sameSite: "strict",
    secure: true,
  });

  res.cookie(`VAO${isBo ? "_BO" : ""}_refresh_token`, refreshToken, {
    httpOnly: true,
    maxAge: config.refreshToken.expiresIn,
    sameSite: "strict",
    secure: true,
  });

  const isTrustedToken = isTrustedDevice({
    req,
    target,
    userId: Number(user.id),
  });
  if (!isTrustedToken) {
    const cookieTrustTokenName = `VAO_trust_token-${target}-${user.id}`;
    if (rememberDevice) {
      const trustToken = jwt.sign(
        { __v: config.trustToken.version, userId: Number(user.id!) },
        (isBo ? config.tokenSecret_BO : config.tokenSecret_FO)!,
        { expiresIn: config.trustToken.expiresInSec },
      );

      res.cookie(cookieTrustTokenName, trustToken, {
        httpOnly: true,
        maxAge: config.trustToken.maxAgeMs,
        sameSite: "strict",
        secure: true,
      });
    } else {
      res.clearCookie(cookieTrustTokenName);
    }
  }
}
