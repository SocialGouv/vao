import jwt from "jsonwebtoken";

import config from "../config";

export interface AccessTokenPayload {
  id: number;
  email: string;
  territoireCode: string;
  roles: string[];
  cguAccepted: boolean;
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

export const buildRefreshToken = ({ id: userId }: { id: number }) => ({
  userId,
});
export const buildEmailToken = (email: string) => ({ email });

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
