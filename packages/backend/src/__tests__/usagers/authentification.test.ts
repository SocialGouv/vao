import { ERRORS_COMMON, STATUS_USER_FRONT } from "@vao/shared-bridge";
import jwt from "jsonwebtoken";
import request from "supertest";

import { config } from "../../config";
import { getEtablissement } from "../../services/Insee";
import { mailService } from "../../services/mail";
import * as UserService from "../../services/User";
import { UsersRepository as UsagersUsersRepository } from "../../usagers/users/users.repository";
import { getPool } from "../../utils/pgpool";
import { getFoAppHelper } from "../helpers/appHelper";
import { createOrganisme } from "../helpers/organismeHelper";
import { createTerritoire } from "../helpers/territoireHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helpers/testContainer";
import { createUsagersUserValide } from "../helpers/userHelper";

jest.mock("../../services/mail", () => ({
  mailService: { send: jest.fn() },
}));

jest.mock("../../services/Insee", () => ({
  getEtablissement: jest.fn(),
}));

beforeAll(async () => {
  await createTestContainer();
});

afterAll(async () => {
  await removeTestContainer();
});

beforeEach(() => {
  jest.clearAllMocks();
  (mailService.send as jest.Mock).mockResolvedValue(undefined);
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

    const response = await request(getFoAppHelper({ id: 1 }))
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

    const response = await request(getFoAppHelper())
      .post("/authentication/email/register")
      .send(invalidPayload);

    expect(response.status).toBe(400);
    expect(response.body.name).toBe("ValidationError");
    expect(response.body.errors).toBeDefined();
  });

  it("should return 200 and send account already exists mail for existing user", async () => {
    const timestamp = Date.now();
    const email = `existing-user-ok-${timestamp}@example.com`;

    await UsagersUsersRepository.create({
      user: {
        cgu_accepted: false,
        email,
        nom: "Doe",
        password: "HelloHello1!!",
        prenom: "John",
        siret: "12345678900011",
        status_code: STATUS_USER_FRONT.NEED_EMAIL_VALIDATION,
        telephone: "0102030405",
        ter_code: "FRA",
      },
    });
    (mailService.send as jest.Mock).mockResolvedValue(undefined);

    const response = await request(getFoAppHelper())
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
    expect(mailService.send).toHaveBeenCalled();
    const accountExistsMail = (mailService.send as jest.Mock).mock.calls.find(
      ([payload]: [{ subject: string; to: string }]) =>
        payload.subject.includes("existe déjà"),
    )?.[0];
    expect(accountExistsMail?.to).toBe(email);
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
        status_code: STATUS_USER_FRONT.NEED_EMAIL_VALIDATION,
        telephone: "0102030405",
        ter_code: "FRA",
      },
    });

    (mailService.send as jest.Mock).mockRejectedValue(new Error("SMTP error"));

    const response = await request(getFoAppHelper())
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

    const response = await request(getFoAppHelper())
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

    const response = await request(getFoAppHelper())
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

    const response = await request(getFoAppHelper())
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
    expect(mailService.send).toHaveBeenCalled();
    const validationMail = (mailService.send as jest.Mock).mock.calls.find(
      ([payload]: [{ subject: string; to: string }]) =>
        payload.subject.includes("Validez votre adresse courriel"),
    )?.[0];
    expect(validationMail?.to).toBe(email);
  });
});

describe("POST /authentication/email/forgotten-password", () => {
  it("retourne 200 et envoie le mail de réinitialisation du mot de passe", async () => {
    const password = "HelloHello1!!";
    const timestamp = Date.now();
    const email = `fo-forgot-${timestamp}@example.com`;

    await UsagersUsersRepository.create({
      user: {
        cgu_accepted: true,
        email,
        nom: "Doe",
        password,
        prenom: "John",
        siret: "12345678900011",
        status_code: STATUS_USER_FRONT.VALIDATED,
        telephone: "0102030405",
        ter_code: "FRA",
      },
    });
    (mailService.send as jest.Mock).mockResolvedValue(undefined);

    const response = await request(getFoAppHelper())
      .post("/authentication/email/forgotten-password")
      .send({ email });

    expect(response.status).toBe(200);
    expect(mailService.send).toHaveBeenCalled();
    const resetMail = (mailService.send as jest.Mock).mock.calls.find(
      ([payload]: [{ subject: string; to: string }]) =>
        payload.subject.includes("Réinitialisation du mot de passe"),
    )?.[0];
    expect(resetMail?.to).toBe(email);
  });

  it("retourne 400 quand l'email est manquant", async () => {
    const response = await request(getFoAppHelper())
      .post("/authentication/email/forgotten-password")
      .send({});

    expect(response.status).toBe(400);
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
        status_code: STATUS_USER_FRONT.VALIDATED,
        telephone: "0102030405",
        ter_code: "FRA",
      },
    });

    expect(createdUsers[0]).toBeDefined();

    const response = await request(getFoAppHelper())
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
    const response = await request(getFoAppHelper())
      .post("/authentication/email/login")
      .send({ email: "missing-password@example.com" });

    expect(response.status).toBe(400);
  });

  it("should return 404 if user is not found", async () => {
    const response = await request(getFoAppHelper())
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
        status_code: STATUS_USER_FRONT.NEED_EMAIL_VALIDATION,
        telephone: "0102030405",
        ter_code: "FRA",
      },
    });

    expect(createdUsers[0]).toBeDefined();

    const response = await request(getFoAppHelper())
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
        status_code: STATUS_USER_FRONT.BLOCKED,
        telephone: "0102030405",
        ter_code: "FRA",
      },
    });

    expect(createdUsers[0]).toBeDefined();

    const response = await request(getFoAppHelper())
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
        status_code: STATUS_USER_FRONT.TEMPORARY_BLOCKED,
        telephone: "0102030405",
        ter_code: "FRA",
      },
    });

    expect(createdUsers[0]).toBeDefined();

    const response = await request(getFoAppHelper())
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

    const response = await request(getFoAppHelper())
      .post("/authentication/email/renew-password")
      .query({ token })
      .send({ password: "NewPassword1!!" });

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe(email.toLowerCase());
    expect(response.body.user.statusCode).toBe("VALIDATED");
  });

  it("should return 400 error if token is missing", async () => {
    const response = await request(getFoAppHelper())
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

    const response = await request(getFoAppHelper())
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

    const response = await request(getFoAppHelper())
      .post("/authentication/email/renew-password")
      .query({ token })
      .send({ password: "NewPassword1!!" });

    expect(response.status).toBe(200);
    expect(response.body.user.statusCode).toBe("NEED_SIRET_VALIDATION");
  });
});

describe("POST /authentication/email/renew-token", () => {
  it("should return 400 when email is missing", async () => {
    const response = await request(getFoAppHelper())
      .post("/authentication/email/renew-token")
      .send({});

    expect(response.status).toBe(400);
  });

  it("should return 200 for existing user waiting email validation", async () => {
    const timestamp = Date.now();
    const email = `fo-renew-${timestamp}@example.com`;

    await UsagersUsersRepository.create({
      user: {
        cgu_accepted: false,
        email,
        nom: "Doe",
        password: "HelloHello1!!",
        prenom: "John",
        siret: "12345678900011",
        status_code: STATUS_USER_FRONT.NEED_EMAIL_VALIDATION,
        telephone: "0102030405",
        ter_code: "FRA",
      },
    });
    (mailService.send as jest.Mock).mockResolvedValue(undefined);

    const response = await request(getFoAppHelper())
      .post("/authentication/email/renew-token")
      .send({ email });

    expect(response.status).toBe(200);
    expect(mailService.send).toHaveBeenCalled();
    const validationMail = (mailService.send as jest.Mock).mock.calls.find(
      ([payload]: [{ subject: string }]) =>
        payload.subject.includes("Validez votre adresse courriel"),
    )?.[0];
    expect(validationMail).toBeDefined();
  });
});

describe("POST /authentication/email/validate", () => {
  it("should return 400 when token is missing", async () => {
    const response = await request(getFoAppHelper())
      .post("/authentication/email/validate")
      .send({});

    expect(response.status).toBe(400);
  });

  it("should return 200 and user for a valid token", async () => {
    const timestamp = Date.now();
    const email = `fo-validate-${timestamp}@example.com`;

    await UsagersUsersRepository.create({
      user: {
        cgu_accepted: false,
        email,
        nom: "Doe",
        password: "HelloHello1!!",
        prenom: "John",
        siret: "12345678900011",
        status_code: STATUS_USER_FRONT.NEED_EMAIL_VALIDATION,
        telephone: "0102030405",
        ter_code: "FRA",
      },
    });
    (mailService.send as jest.Mock).mockResolvedValue(undefined);

    const token = jwt.sign({ email }, config.tokenSecret as string, {
      algorithm: config.algorithm as jwt.Algorithm,
      expiresIn: 60,
    });

    const response = await request(getFoAppHelper())
      .post("/authentication/email/validate")
      .send({ token });

    expect(response.status).toBe(200);
    expect(
      response.body.user !== undefined ||
        response.body.status === STATUS_USER_FRONT.NEED_SIRET_VALIDATION,
    ).toBe(true);
    expect(mailService.send).toHaveBeenCalled();
    const subjects = (mailService.send as jest.Mock).mock.calls.map(
      ([payload]: [{ subject: string }]) => payload.subject,
    );
    expect(
      subjects.some(
        (subject) =>
          subject.includes("Prochaines étapes") ||
          subject.includes("inscription"),
      ),
    ).toBe(true);
  });

  it("should return 200 and send legacy account validated mail without siret", async () => {
    const timestamp = Date.now();
    const email = `fo-validate-legacy-${timestamp}@example.com`;

    await UsagersUsersRepository.create({
      user: {
        cgu_accepted: false,
        email,
        nom: "Doe",
        password: "HelloHello1!!",
        prenom: "John",
        siret: null,
        status_code: STATUS_USER_FRONT.NEED_EMAIL_VALIDATION,
        telephone: "0102030405",
        ter_code: "FRA",
      },
    });

    const token = jwt.sign({ email }, config.tokenSecret as string, {
      algorithm: config.algorithm as jwt.Algorithm,
      expiresIn: 60,
    });

    const response = await request(getFoAppHelper())
      .post("/authentication/email/validate")
      .send({ token });

    expect(response.status).toBe(200);
    expect(response.body.user).toBeDefined();
    const validatedMail = (mailService.send as jest.Mock).mock.calls.find(
      ([payload]: [{ subject: string }]) =>
        payload.subject.includes("Prochaines étapes"),
    );
    expect(validatedMail).toBeDefined();
  });

  it("should return 200 and send DREETS validation mails when siret has no organisme", async () => {
    const timestamp = Date.now();
    const email = `fo-validate-dreets-${timestamp}@example.com`;
    const siret = `9${timestamp.toString().padStart(13, "0").slice(-13)}`;

    await createTerritoire({
      territoire: { service_mail: `dreets-${timestamp}@example.com` },
      territoireCode: "FRA",
    });

    await UsagersUsersRepository.create({
      user: {
        cgu_accepted: false,
        email,
        nom: "Doe",
        password: "HelloHello1!!",
        prenom: "John",
        siret,
        status_code: STATUS_USER_FRONT.NEED_EMAIL_VALIDATION,
        telephone: "0102030405",
        ter_code: "FRA",
      },
    });

    const token = jwt.sign({ email }, config.tokenSecret as string, {
      algorithm: config.algorithm as jwt.Algorithm,
      expiresIn: 60,
    });

    const response = await request(getFoAppHelper())
      .post("/authentication/email/validate")
      .send({ token });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe(STATUS_USER_FRONT.NEED_SIRET_VALIDATION);
    const subjects = (mailService.send as jest.Mock).mock.calls.map(
      ([payload]: [{ subject: string }]) => payload.subject,
    );
    expect(subjects.some((subject) => subject.includes("inscription"))).toBe(
      true,
    );
    expect(
      subjects.some((subject) => subject.includes("Validation de compte")),
    ).toBe(true);
  });

  it("should return 200 and send organisme validation mails when organisme exists", async () => {
    const timestamp = Date.now();
    const principal = await createUsagersUserValide({
      email: `ova-principal-${timestamp}@example.com`,
    });
    await getPool().query(
      `UPDATE front.users SET status_code = $1 WHERE id = $2`,
      [STATUS_USER_FRONT.VALIDATED, principal.id],
    );
    const organismeId = await createOrganisme({ userId: principal.id });
    const { rows } = await getPool().query(
      `SELECT siret FROM front.personne_physique WHERE organisme_id = $1 AND current = true LIMIT 1`,
      [organismeId],
    );
    const siret = rows[0]?.siret as string;
    const email = `fo-validate-org-${timestamp}@example.com`;

    await UsagersUsersRepository.create({
      user: {
        cgu_accepted: false,
        email,
        nom: "Martin",
        password: "HelloHello1!!",
        prenom: "Paul",
        siret,
        status_code: STATUS_USER_FRONT.NEED_EMAIL_VALIDATION,
        telephone: "0102030405",
        ter_code: "FRA",
      },
    });

    const token = jwt.sign({ email }, config.tokenSecret as string, {
      algorithm: config.algorithm as jwt.Algorithm,
      expiresIn: 60,
    });

    const response = await request(getFoAppHelper())
      .post("/authentication/email/validate")
      .send({ token });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe(STATUS_USER_FRONT.NEED_SIRET_VALIDATION);
    const subjects = (mailService.send as jest.Mock).mock.calls.map(
      ([payload]: [{ subject: string }]) => payload.subject,
    );
    expect(subjects.some((subject) => subject.includes("inscription"))).toBe(
      true,
    );
    expect(
      subjects.some((subject) => subject.includes("Validation de compte")),
    ).toBe(true);
    expect(
      (mailService.send as jest.Mock).mock.calls.some(
        ([payload]: [{ to: string }]) => payload.to === principal.email,
      ),
    ).toBe(true);
  });
});

describe("GET /authentication/check-token", () => {
  it("GET /authentication/check-token retourne 200", async () => {
    const response = await request(getFoAppHelper()).get(
      "/authentication/check-token",
    );

    expect(response.status).toBe(200);
    expect(response.text).toBe("OK");
  });
});

describe("POST /authentication/disconnect", () => {
  it("POST /authentication/disconnect retourne 400 sans refresh token", async () => {
    const response = await request(getFoAppHelper()).post(
      "/authentication/disconnect",
    );

    expect(response.status).toBe(400);
    expect(response.body.name).toBe("MissingRefreshToken");
  });

  it("POST /authentication/disconnect retourne 200 avec des cookies valides", async () => {
    const password = "HelloHello1!!";
    const timestamp = Date.now();
    const email = `front-disconnect-${timestamp}@example.com`;

    await UsagersUsersRepository.create({
      user: {
        cgu_accepted: true,
        email,
        nom: "FrontNom",
        password,
        prenom: "FrontPrenom",
        siret: `123456789012${timestamp.toString().slice(-2)}`,
        status_code: STATUS_USER_FRONT.VALIDATED,
        telephone: "0102030405",
        ter_code: "FRA",
      },
    });

    const loginResponse = await request(getFoAppHelper())
      .post("/authentication/email/login")
      .send({ email, password });

    const setCookieHeader = loginResponse.headers["set-cookie"];
    const cookies = Array.isArray(setCookieHeader)
      ? setCookieHeader
      : setCookieHeader
        ? [setCookieHeader]
        : [];

    const response = await request(getFoAppHelper())
      .post("/authentication/disconnect")
      .set("Cookie", cookies);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Déconnexion");
  });
});
