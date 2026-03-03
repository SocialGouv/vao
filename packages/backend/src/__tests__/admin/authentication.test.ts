import { ERRORS_LOGIN } from "@vao/shared-bridge";
import crypto from "crypto";
import request from "supertest";

import app from "../../app";
import config from "../../config";
import { UsersRepository as AdminUsersRepository } from "../../repositories/admin/Users";
import {
  createTestContainer,
  removeTestContainer,
} from "../helper/testContainer";

beforeAll(async () => {
  await createTestContainer();

  config.tokenSecret_BO = crypto.randomBytes(32).toString("hex");
  config.algorithm = "HS256";
  config.accessToken.expiresIn = 60000;
  config.refreshToken.expiresIn = 120000;
});

afterAll(async () => {
  await removeTestContainer();
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

    const response = await request(app)
      .post("/bo-authentication/email/login")
      .send({ email, password });

    expect(response.status).toBe(200);
    expect(response.body.user).toBeDefined();
    expect(response.body.user.email).toBe(email);
    expect(response.body.user.featureFlags).toBeDefined();

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

    const response = await request(app)
      .post("/bo-authentication/email/login")
      .send({ email, password });

    expect(response.status).toBe(404);
    expect(response.body.name).toBe(ERRORS_LOGIN.WrongCredentials);
  });

  it("should return 400 when payload is invalid", async () => {
    const timestamp = Date.now();
    const email = `bo-login-bad-payload-${timestamp}@example.com`;

    const response = await request(app)
      .post("/bo-authentication/email/login")
      // missing password
      .send({ email });

    expect(response.status).toBe(400);
    expect(response.body.name).toBe("AppError");
  });
});
