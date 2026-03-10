import { ERRORS_COMMON, statusUserFront } from "@vao/shared-bridge";
import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import request from "supertest";

import app from "../../app";
import config from "../../config";
import { UsersRepository as UsagersUsersRepository } from "../../repositories/usagers/Users";
import { getEtablissement } from "../../services/Insee";
import { mailService } from "../../services/mail";
import * as UserService from "../../services/User";
import { User, UserRequest } from "../../types/request";
import {
  createTestContainer,
  removeTestContainer,
} from "../helper/testContainer";

jest.mock("../../services/mail", () => ({
  mailService: { send: jest.fn() },
}));

jest.mock("../../middlewares/checkJWT", () =>
  jest.fn((req: UserRequest, _res: Response, next: NextFunction) => {
    req.decoded = { id: 1, role: "admin" } as unknown as User;
    next();
  }),
);

jest.mock("../../services/Insee", () => ({
  getEtablissement: jest.fn(),
}));

beforeAll(async () => {
  await createTestContainer();
});

afterAll(async () => {
  await removeTestContainer();
});

describe("POST /authentication/email/register", () => {
  it("should return 400 if SIRET is not found", async () => {
    (getEtablissement as jest.Mock).mockResolvedValue(null);

    const payload = {
      email: "test@example.com",
      nom: "Doe",
      password: "HelloHello1!!",
      prenom: "John",
      siret: "00000000000000",
      telephone: "0102030405",
    };

    const response = await request(app)
      .post("/authentication/email/register")
      .send(payload);

    expect(response.status).toBe(400);
    expect(response.body.name).toBe("SiretNotFound");
  });

  it("should return 400 when validation fails", async () => {
    const invalidPayload = {
      email: "invalid-email",
      nom: "Doe",
      password: "short",
      prenom: "John",
      siret: "12345678900011",
      telephone: "0102030405",
    };

    const response = await request(app)
      .post("/authentication/email/register")
      .send(invalidPayload);

    expect(response.status).toBe(400);
    expect(response.body.name).toBe("ValidationError");
    expect(response.body.errors).toBeDefined();
  });

  it("should return 500 if mail sending fails for existing user", async () => {
    const timestamp = Date.now();
    const email = `existing-user-${timestamp}@example.com`;

    await UsagersUsersRepository.create({
      user: {
        cgu_accepted: false,
        email,
        nom: "Doe",
        password: "HelloHello1!!",
        prenom: "John",
        siret: "12345678900011",
        status_code: statusUserFront.NEED_EMAIL_VALIDATION,
        telephone: "0102030405",
        ter_code: "FRA",
      },
    });

    (mailService.send as jest.Mock).mockRejectedValue(new Error("SMTP error"));

    const response = await request(app)
      .post("/authentication/email/register")
      .send({
        email,
        nom: "Doe",
        password: "HelloHello1!!",
        prenom: "John",
        siret: "12345678900011",
        telephone: "0102030405",
      });

    expect(response.status).toBe(500);
    expect(response.body.name).toBe("MailError");
  });

  it("should return 500 if INSEE lookup fails", async () => {
    const timestamp = Date.now();
    (getEtablissement as jest.Mock).mockRejectedValue(new Error("INSEE down"));

    const response = await request(app)
      .post("/authentication/email/register")
      .send({
        email: `insee-fail-${timestamp}@example.com`,
        nom: "Doe",
        password: "HelloHello1!!",
        prenom: "John",
        siret: "12345678900011",
        telephone: "0102030405",
      });

    expect(response.status).toBe(500);
    expect(response.body.name).toBe("UnexpectedError");
  });

  it("should return 500 if validation mail sending fails", async () => {
    const timestamp = Date.now();
    const email = `register-mail-fail-${timestamp}@example.com`;

    (getEtablissement as jest.Mock).mockResolvedValue({
      adresseEtablissement: { codeCommuneEtablissement: "75101" },
    });
    (mailService.send as jest.Mock).mockRejectedValue(new Error("SMTP error"));

    const response = await request(app)
      .post("/authentication/email/register")
      .send({
        email,
        nom: "Doe",
        password: "HelloHello1!!",
        prenom: "John",
        siret: "12345678900011",
        telephone: "0102030405",
      });

    expect(response.status).toBe(500);
    expect(response.body.name).toBe("MailError");
  });

  it("should register user and return 200 with code", async () => {
    const timestamp = Date.now();
    const email = `register-ok-${timestamp}@example.com`;

    (getEtablissement as jest.Mock).mockResolvedValue({
      adresseEtablissement: { codeCommuneEtablissement: "75101" },
    });
    (mailService.send as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app)
      .post("/authentication/email/register")
      .send({
        email,
        nom: "Doe",
        password: "HelloHello1!!",
        prenom: "John",
        siret: "12345678900011",
        telephone: "0102030405",
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ code: "CreationCompte" });
  });
});

describe("POST /authentication/email/login", () => {
  it("should login a validated front user and set cookies", async () => {
    const password = "HelloHello1!!";
    const timestamp = Date.now();
    const email = `frontlogin${timestamp}@example.com`;

    const { user: createdUsers } = await UsagersUsersRepository.create({
      user: {
        cgu_accepted: true,
        email,
        nom: "FrontNom",
        password,
        prenom: "FrontPrenom",
        siret: `123456789012${timestamp.toString().slice(-2)}`,
        status_code: statusUserFront.VALIDATED,
        telephone: "0102030405",
        ter_code: "FRA",
      },
    });

    expect(createdUsers[0]).toBeDefined();

    const response = await request(app)
      .post("/authentication/email/login")
      .send({ email, password });

    expect(response.status).toBe(200);
    expect(response.body.user).toBeDefined();
    expect(response.body.user.email).toBe(email);
    expect(response.body.user.featureFlags).toBeDefined();

    const setCookieHeader = response.headers["set-cookie"] || [];
    expect(setCookieHeader).toEqual(
      expect.arrayContaining([
        expect.stringContaining("VAO_access_token="),
        expect.stringContaining("VAO_refresh_token="),
      ]),
    );
  });

  it("should return 400 if email or password is missing", async () => {
    const response = await request(app)
      .post("/authentication/email/login")
      .send({ email: "missing-password@example.com" });

    expect(response.status).toBe(400);
  });

  it("should return 404 if user is not found", async () => {
    const response = await request(app)
      .post("/authentication/email/login")
      .send({
        email: "unknown-user@example.com",
        password: "SomePassword1!!",
      });

    expect(response.status).toBe(404);
    expect(response.body.name).toBe("WrongCredentials");
  });

  it("should return 400 if account needs email or SIRET validation", async () => {
    const password = "HelloHello1!!";
    const timestamp = Date.now();
    const email = `frontlogin-need-validation-${timestamp}@example.com`;

    const { user: createdUsers } = await UsagersUsersRepository.create({
      user: {
        cgu_accepted: true,
        email,
        nom: "FrontNom",
        password,
        prenom: "FrontPrenom",
        siret: `123456789012${timestamp.toString().slice(-2)}`,
        status_code: statusUserFront.NEED_EMAIL_VALIDATION,
        telephone: "0102030405",
        ter_code: "FRA",
      },
    });

    expect(createdUsers[0]).toBeDefined();

    const response = await request(app)
      .post("/authentication/email/login")
      .send({ email, password });

    expect(response.status).toBe(400);
    expect(response.body.name).toBe("NeedEmailValidation");
  });

  it("should return 400 if account is blocked", async () => {
    const password = "HelloHello1!!";
    const timestamp = Date.now();
    const email = `frontlogin-blocked-${timestamp}@example.com`;

    const { user: createdUsers } = await UsagersUsersRepository.create({
      user: {
        cgu_accepted: true,
        email,
        nom: "FrontNom",
        password,
        prenom: "FrontPrenom",
        siret: `123456789012${timestamp.toString().slice(-2)}`,
        status_code: statusUserFront.BLOCKED,
        telephone: "0102030405",
        ter_code: "FRA",
      },
    });

    expect(createdUsers[0]).toBeDefined();

    const response = await request(app)
      .post("/authentication/email/login")
      .send({ email, password });

    expect(response.status).toBe(400);
    expect(response.body.name).toBe("EmailUnauthorized");
  });

  it("should return 400 if account is temporarily blocked", async () => {
    const password = "HelloHello1!!";
    const timestamp = Date.now();
    const email = `frontlogin-temp-blocked-${timestamp}@example.com`;

    const { user: createdUsers } = await UsagersUsersRepository.create({
      user: {
        cgu_accepted: true,
        email,
        nom: "FrontNom",
        password,
        prenom: "FrontPrenom",
        siret: `123456789012${timestamp.toString().slice(-2)}`,
        status_code: statusUserFront.TEMPORARY_BLOCKED,
        telephone: "0102030405",
        ter_code: "FRA",
      },
    });

    expect(createdUsers[0]).toBeDefined();

    const response = await request(app)
      .post("/authentication/email/login")
      .send({ email, password });

    expect(response.status).toBe(400);
    expect(response.body.name).toBe("UserTemporarilyBlocked");
  });
});

describe("POST /authentication/email/renew-password", () => {
  it("should reactivate a TEMPORARY_BLOCKED user and return 200", async () => {
    const timestamp = Date.now();
    const email = `renew-temp-blocked-${timestamp}@example.com`;

    const { user } = await UserService.registerByEmail({
      email,
      nom: "Doe",
      password: "OldPassword1!!",
      prenom: "John",
      siret: "12345678900011",
      telephone: "0102030405",
      terCode: "FRA",
    });

    await UserService.editStatus(user.id, "TEMPORARY_BLOCKED");

    const token = jwt.sign({ email }, config.tokenSecret as string, {
      algorithm: config.algorithm as jwt.Algorithm,
      expiresIn: Math.floor(config.resetPasswordToken.expiresIn / 1000),
    });

    const response = await request(app)
      .post("/authentication/email/renew-password")
      .query({ token })
      .send({ password: "NewPassword1!!" });

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe(email.toLowerCase());
    expect(response.body.user.statusCode).toBe("VALIDATED");
  });

  it("should return 400 error if token is missing", async () => {
    const response = await request(app)
      .post("/authentication/email/renew-password")
      .send({ password: "NewPassword1!!" });

    expect(response.status).toBe(400);
    expect(response.body.name).toBe(ERRORS_COMMON.INVALID_QUERY);
  });

  it("should NOT activate user if status is VALIDATED", async () => {
    const timestamp = Date.now();
    const email = `renew-validated-${timestamp}@example.com`;

    const { user } = await UserService.registerByEmail({
      email,
      nom: "Doe",
      password: "OldPassword1!!",
      prenom: "John",
      siret: "12345678900011",
      telephone: "0102030405",
      terCode: "FRA",
    });

    await UserService.editStatus(user.id, "VALIDATED");

    const token = jwt.sign({ email }, config.tokenSecret as string, {
      algorithm: config.algorithm as jwt.Algorithm,
      expiresIn: Math.floor(config.resetPasswordToken.expiresIn / 1000),
    });

    const response = await request(app)
      .post("/authentication/email/renew-password")
      .query({ token })
      .send({ password: "NewPassword1!!" });

    expect(response.status).toBe(200);
    expect(response.body.user.statusCode).toBe("VALIDATED");
  });

  it("should NOT activate user if status is NEED_SIRET_VALIDATION", async () => {
    const timestamp = Date.now();
    const email = `renew-need-siret-${timestamp}@example.com`;

    const { user } = await UserService.registerByEmail({
      email,
      nom: "Doe",
      password: "OldPassword1!!",
      prenom: "John",
      siret: "12345678900011",
      telephone: "0102030405",
      terCode: "FRA",
    });

    await UserService.editStatus(user.id, "NEED_SIRET_VALIDATION");

    const token = jwt.sign({ email }, config.tokenSecret as string, {
      algorithm: config.algorithm as jwt.Algorithm,
      expiresIn: Math.floor(config.resetPasswordToken.expiresIn / 1000),
    });

    const response = await request(app)
      .post("/authentication/email/renew-password")
      .query({ token })
      .send({ password: "NewPassword1!!" });

    expect(response.status).toBe(200);
    expect(response.body.user.statusCode).toBe("NEED_SIRET_VALIDATION");
  });
});
