import jwt from "jsonwebtoken";

import config from "../config";

export interface AccessTokenPayload {
  id: Number;
  email: String;
  territoireCode: String;
  roles: String[];
  cguAccepted: Boolean;
}

export const buildAccessToken = ({
  cguAccepted,
  id,
  email,
  roles,
  territoireCode,
}: AccessTokenPayload) => ({
  cguAccepted,
  email,
  id,
  roles,
  territoireCode,
});

export const buildRefreshToken = ({ id: userId }: { id: Number }) => ({
  userId,
});
export const buildEmailToken = (email: String) => ({ email });

export const signAccessToken = (user: AccessTokenPayload) => {
  return jwt.sign(buildAccessToken(user), config.tokenSecret_BO as string, {
    algorithm: config.algorithm as jwt.Algorithm,
    expiresIn: Math.floor(config.accessToken.expiresIn / 1000),
  });
};

export const signRefreshToken = (user: AccessTokenPayload) => {
  return jwt.sign(buildRefreshToken(user), config.tokenSecret_BO as string, {
    algorithm: config.algorithm as jwt.Algorithm,
    expiresIn: Math.floor(config.refreshToken.expiresIn / 1000),
  });
};
