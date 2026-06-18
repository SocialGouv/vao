import { STATUS_USER_FRONT } from "@vao/shared-bridge";
import request from "supertest";

import { roles } from "../../helpers/users";
import { mailService } from "../../services/mail";
import { AppHelperUser, getBoAppHelper } from "../helpers/appHelper";
import { createDemandeSejour } from "../helpers/demandeSejourHelper";
import { createHebergement } from "../helpers/hebergementHelper";
import { createOrganisme } from "../helpers/organismeHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helpers/testContainer";
import {
  createAdminUserValide,
  createUsagersUserValide,
} from "../helpers/userHelper";

jest.mock("../../services/mail", () => ({
  mailService: { send: jest.fn() },
}));

let boUser: AppHelperUser;
let declarationId = 0;

beforeAll(async () => {
  await createTestContainer();
  const foUser = await createUsagersUserValide({
    statusCode: STATUS_USER_FRONT.VALIDATED,
  });
  boUser = await createAdminUserValide({
    roles: [roles.DEMANDE_SEJOUR_LECTURE, roles.DEMANDE_SEJOUR_ECRITURE],
    ter_code: "FRA",
  });
  const organismeId = await createOrganisme({ userId: foUser.id });
  declarationId = await createDemandeSejour({ organismeId });
  await createHebergement({ declarationId, organismeId });
});

afterAll(async () => {
  await removeTestContainer();
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("POST /message/admin/:declarationId", () => {
  it("retourne 200", async () => {
    const response = await request(getBoAppHelper(boUser))
      .post(`/message/admin/${declarationId}`)
      .send({
        message: "Message BO valide",
      });
    expect(response.status).toBe(200);
    expect(mailService.send).toHaveBeenCalledTimes(1);
    const mailPayload = (mailService.send as jest.Mock).mock.calls[0][0];
    expect(mailPayload.subject).toContain("nouveau message");
  });

  it("retourne 400 si le body est invalide", async () => {
    const response = await request(getBoAppHelper(boUser))
      .post(`/message/admin/${declarationId}`)
      .send({});
    expect(response.status).toBe(400);
  });
});

describe("GET /message/admin/read/:declarationId", () => {
  it("retourne 200", async () => {
    const response = await request(getBoAppHelper(boUser)).get(
      `/message/admin/read/${declarationId}`,
    );
    expect(response.status).toBe(200);
  });

  it("retourne 400 si declarationId est invalide", async () => {
    const response = await request(getBoAppHelper(boUser)).get(
      "/message/admin/read/abc",
    );
    expect(response.status).toBe(400);
  });
});

describe("GET /message/admin/:declarationId", () => {
  it("retourne 200", async () => {
    const response = await request(getBoAppHelper(boUser)).get(
      `/message/admin/${declarationId}`,
    );
    expect(response.status).toBe(200);
  });

  it("retourne 400 si declarationId est invalide", async () => {
    const response = await request(getBoAppHelper(boUser)).get(
      "/message/admin/abc",
    );
    expect(response.status).toBe(400);
  });
});
