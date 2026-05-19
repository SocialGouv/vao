import type { Application } from "express";
import { NextFunction, Response } from "express";

import app from "../../app";
import { schema } from "../../helpers/schema";
import boCheckJWT from "../../middlewares/bo-check-JWT";
import checkJWT from "../../middlewares/checkJWT";
import Session from "../../services/common/Session";
import { User, UserRequest } from "../../types/request";
import {
  signAccessToken as signBoAccessToken,
  signRefreshToken as signBoRefreshToken,
} from "../../utils/bo-token";
import {
  signAccessToken as signFoAccessToken,
  signRefreshToken as signFoRefreshToken,
} from "../../utils/token";

jest.mock("../../middlewares/bo-check-JWT", () => jest.fn());
jest.mock("../../middlewares/checkJWT", () => jest.fn());

export type AppHelperUser = { id: number; prenom?: string } & Partial<
  Omit<User, "id">
>;

export type MockJwtUserOptions = {
  once?: boolean;
};

export const getBoAppHelper = (
  user?: AppHelperUser,
  options?: MockJwtUserOptions,
): Application => {
  if (user) {
    applyMock(boCheckJWT as unknown as jest.Mock, user, options);
  }
  return app;
};

export const getFoAppHelper = (
  user?: AppHelperUser,
  options?: MockJwtUserOptions,
): Application => {
  if (user) {
    applyMock(checkJWT as unknown as jest.Mock, user, options);
  }
  return app;
};

const applyMock = (
  mock: jest.Mock,
  user: AppHelperUser,
  options: MockJwtUserOptions = {},
): void => {
  const { once = false } = options;
  const implementation = (
    req: UserRequest,
    res: Response,
    next: NextFunction,
  ) => {
    req.decoded = user as unknown as User;
    next();
  };

  if (once) {
    mock.mockImplementationOnce(implementation);
  } else {
    mock.mockImplementation(implementation);
  }
};

export async function createFoUserSessionCookies(
  user: AppHelperUser & { cgu_accepted?: boolean; ter_code?: string },
): Promise<string[]> {
  const territoireCode = user.territoireCode ?? user.ter_code ?? "FRA";
  const cguAccepted = user.cguAccepted ?? user.cgu_accepted ?? false;
  const tokenUser = {
    cguAccepted,
    email: user.email!,
    id: user.id,
    territoireCode,
  };
  const accessToken = signFoAccessToken(tokenUser);
  const refreshToken = signFoRefreshToken(tokenUser);
  await Session.clean({ id: user.id }, schema.FRONT);
  await Session.create(user.id, refreshToken, schema.FRONT);
  return [
    `VAO_access_token=${accessToken}`,
    `VAO_refresh_token=${refreshToken}`,
  ];
}

export async function createBoUserSessionCookies(
  user: AppHelperUser & { cgu_accepted?: boolean; ter_code?: string },
): Promise<string[]> {
  const territoireCode = user.territoireCode ?? user.ter_code ?? "FRA";
  const cguAccepted = user.cguAccepted ?? user.cgu_accepted ?? false;
  const roles = user.roles ?? ["Compte"];
  const tokenUser = {
    cguAccepted,
    email: user.email!,
    id: user.id,
    roles,
    territoireCode,
  };
  const accessToken = signBoAccessToken(tokenUser);
  const refreshToken = signBoRefreshToken(tokenUser);
  await Session.clean({ id: user.id }, schema.BACK);
  await Session.create(user.id, refreshToken, schema.BACK);
  return [
    `VAO_BO_access_token=${accessToken}`,
    `VAO_BO_refresh_token=${refreshToken}`,
  ];
}
