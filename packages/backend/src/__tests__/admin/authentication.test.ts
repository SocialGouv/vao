import { ERRORS_LOGIN } from "@vao/shared-bridge";
import jwt from "jsonwebtoken";
import request from "supertest";

import { UsersRepository as AdminUsersRepository } from "../../admin/users/users.repository";
import { config } from "../../config";
import { mailService } from "../../services/mail";
import { getBoAppHelper } from "../helpers/appHelper";
import { createFeatureFlag } from "../helpers/featureFlagHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helpers/testContainer";

jest.mock("../../services/mail", () => ({
  mailService: { send: jest.fn() },
}));

beforeAll(async () => {
  await createTestContainer();

  config.algorithm = "HS256";
  config.accessToken.expiresIn = 60000;
  config.refreshToken.expiresIn = 120000;
});

afterAll(async () => {
  await removeTestContainer();
});

beforeEach(() => {
  jest.clearAllMocks();
  (mailService.send as jest.Mock).mockResolvedValue(undefined);
});

describe("POST /bo-authentication/email/login", () => {
  it("should login a validated admin user and set BO cookies", async () => {
    const password = "HelloHello1!!";
    const timestamp = Date.now();
    const email = `bologin${timestamp}@example.com`;

    const { user: createdUsers } = await AdminUsersRepository.create({
      user: {
        cgu_accepted: true,
        cgu_accepted_at: new Date(),
        deleted: false,
        email,
        nom: "BoNom",
        password,
        prenom: "BoPrenom",
        ter_code: "FRA",
        validated: true,
      },
    });

    expect(createdUsers[0]).toBeDefined();
    await createFeatureFlag({});

    const response = await request(getBoAppHelper())
      .post("/bo-authentication/email/login")
      .send({ email, password });

    expect(response.status).toBe(200);
    expect(response.body.user).toBeDefined();
    expect(response.body.user.email).toBe(email);
    expect(response.body.user.featureFlags).toBeDefined();
    expect(mailService.send).toHaveBeenCalledTimes(1);

    const setCookieHeader = response.headers["set-cookie"] || [];
    expect(setCookieHeader).toEqual(
      expect.arrayContaining([
        expect.stringContaining("VAO_BO_access_token="),
        expect.stringContaining("VAO_BO_refresh_token="),
      ]),
    );
  });

  it("should return 404 when admin user does not exist", async () => {
    const password = "SomePassword1!!";
    const timestamp = Date.now();
    const email = `bo-login-not-found-${timestamp}@example.com`;

    const response = await request(getBoAppHelper())
      .post("/bo-authentication/email/login")
      .send({ email, password });

    expect(response.status).toBe(404);
    expect(response.body.name).toBe(ERRORS_LOGIN.WrongCredentials);
  });

  it("should return 400 when payload is invalid", async () => {
    const timestamp = Date.now();
    const email = `bo-login-bad-payload-${timestamp}@example.com`;

    const response = await request(getBoAppHelper())
      .post("/bo-authentication/email/login")
      // missing password
      .send({ email });

    expect(response.status).toBe(400);
    expect(response.body.name).toBe("AppError");
  });
});

describe("POST /bo-authentication/email/forgotten-password", () => {
  it("retourne 200 et envoie le mail de réinitialisation du mot de passe", async () => {
    const timestamp = Date.now();
    const email = `bo-forgot-${timestamp}@example.com`;

    await AdminUsersRepository.create({
      user: {
        cgu_accepted: true,
        cgu_accepted_at: new Date(),
        deleted: false,
        email,
        nom: "BoNom",
        password: "HelloHello1!!",
        prenom: "BoPrenom",
        ter_code: "FRA",
        validated: true,
      },
    });
    (mailService.send as jest.Mock).mockResolvedValue(undefined);

    const response = await request(getBoAppHelper())
      .post("/bo-authentication/email/forgotten-password")
      .send({ email });

    expect(response.status).toBe(200);
    expect(mailService.send).toHaveBeenCalledTimes(1);
    const mailPayload = (mailService.send as jest.Mock).mock.calls[0][0];
    expect(mailPayload.to).toBe(email);
    expect(mailPayload.subject).toContain("Réinitialisation du mot de passe");
  });

  it("retourne 400 quand l'email est manquant", async () => {
    const response = await request(getBoAppHelper())
      .post("/bo-authentication/email/forgotten-password")
      .send({});

    expect(response.status).toBe(400);
  });
});

describe("POST /bo-authentication/email/renew-token", () => {
  it("should return 400 when email is missing", async () => {
    const response = await request(getBoAppHelper())
      .post("/bo-authentication/email/renew-token")
      .send({});

    expect(response.status).toBe(400);
  });

  it("should return 200 for existing unvalidated user", async () => {
    const timestamp = Date.now();
    const email = `bo-renew-${timestamp}@example.com`;

    await AdminUsersRepository.create({
      user: {
        cgu_accepted: false,
        cgu_accepted_at: null,
        deleted: false,
        email,
        nom: "BoNom",
        password: "HelloHello1!!",
        prenom: "BoPrenom",
        ter_code: "FRA",
        validated: false,
      },
    });
    (mailService.send as jest.Mock).mockResolvedValue(undefined);

    const response = await request(getBoAppHelper())
      .post("/bo-authentication/email/renew-token")
      .send({ email });

    expect(response.status).toBe(200);
    expect(mailService.send).toHaveBeenCalled();
    const validationMail = (mailService.send as jest.Mock).mock.calls.find(
      ([payload]: [{ subject: string }]) =>
        payload.subject.includes("Validez votre courriel"),
    )?.[0];
    expect(validationMail).toBeDefined();
  });
});

describe("POST /bo-authentication/email/validate", () => {
  it("should return 400 when token is missing", async () => {
    const response = await request(getBoAppHelper())
      .post("/bo-authentication/email/validate")
      .send({});

    expect(response.status).toBe(400);
  });

  it("should validate user with a valid token", async () => {
    const timestamp = Date.now();
    const email = `bo-validate-${timestamp}@example.com`;

    await AdminUsersRepository.create({
      user: {
        cgu_accepted: false,
        cgu_accepted_at: null,
        deleted: false,
        email,
        nom: "BoNom",
        password: "HelloHello1!!",
        prenom: "BoPrenom",
        ter_code: "FRA",
        validated: false,
      },
    });

    const token = jwt.sign({ email }, config.tokenSecret as string, {
      algorithm: config.algorithm as jwt.Algorithm,
      expiresIn: 60,
    });

    const response = await request(getBoAppHelper())
      .post("/bo-authentication/email/validate")
      .send({ token });

    expect(response.status).toBe(200);
    expect(response.body.user).toBeDefined();
  });
});

it("GET /bo-authentication/check-token retourne 200", async () => {
  const response = await request(getBoAppHelper({ id: 1 })).get(
    "/bo-authentication/check-token",
  );

  expect(response.status).toBe(200);
  expect(response.text).toBe("OK");
});

it("POST /bo-authentication/disconnect retourne 400 sans refresh token", async () => {
  const response = await request(getBoAppHelper()).post(
    "/bo-authentication/disconnect",
  );

  expect(response.status).toBe(400);
  expect(response.body.name).toBe("MissingRefreshToken");
});

it("POST /bo-authentication/disconnect retourne 200 avec des cookies valides", async () => {
  const password = "HelloHello1!!";
  const timestamp = Date.now();
  const email = `bo-disconnect-${timestamp}@example.com`;

  await AdminUsersRepository.create({
    user: {
      cgu_accepted: true,
      cgu_accepted_at: new Date(),
      deleted: false,
      email,
      nom: "BoNom",
      password,
      prenom: "BoPrenom",
      ter_code: "FRA",
      validated: true,
    },
  });

  const loginResponse = await request(getBoAppHelper())
    .post("/bo-authentication/email/login")
    .send({ email, password });

  const setCookieHeader = loginResponse.headers["set-cookie"];
  const cookies = Array.isArray(setCookieHeader)
    ? setCookieHeader
    : setCookieHeader
      ? [setCookieHeader]
      : [];

  const response = await request(getBoAppHelper())
    .post("/bo-authentication/disconnect")
    .set("Cookie", cookies);

  expect(response.status).toBe(200);
  expect(response.body.message).toBe("Déconnexion");
});
