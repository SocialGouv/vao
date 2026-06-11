import { UserAdminDto, UserUsagersDto } from "@vao/shared-bridge";
import type { Response } from "express";

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

export default async function connected(
  res: Response,
  user: UserUsagersDto | UserAdminDto,
  target: "bo" | "fo",
) {
  const isBo = target === "bo";
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
}
