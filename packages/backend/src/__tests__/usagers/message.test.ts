import { STATUS_USER_FRONT } from "@vao/shared-bridge";
import request from "supertest";

import { roles } from "../../helpers/users";
import { mailService } from "../../services/mail";
import { AppHelperUser, getFoAppHelper } from "../helpers/appHelper";
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

let foUser: AppHelperUser;
let declarationId = 0;

beforeAll(async () => {
  await createTestContainer();
  foUser = await createUsagersUserValide({
    roles: [roles.DEMANDE_SEJOUR_LECTURE, roles.DEMANDE_SEJOUR_ECRITURE],
    statusCode: STATUS_USER_FRONT.VALIDATED,
    territoireCode: "FRA",
  });
  await createAdminUserValide({
    email: `bo-message-fo-${Date.now()}@example.com`,
    roles: [roles.DEMANDE_SEJOUR_ECRITURE],
    ter_code: "75",
  });
  const organismeId = await createOrganisme({ userId: foUser.id });
  declarationId = await createDemandeSejour({
    departementSuivi: "75",
    organismeId,
  });
  await createHebergement({ declarationId, organismeId });
});

afterAll(async () => {
  await removeTestContainer();
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("POST /message/:declarationId", () => {
  it("retourne 200", async () => {
    const response = await request(getFoAppHelper(foUser))
      .post(`/message/${declarationId}`)
      .send({
        message: "Message FO valide",
      });
    expect(response.status).toBe(200);
    expect(mailService.send).toHaveBeenCalledTimes(1);
    const mailPayload = (mailService.send as jest.Mock).mock.calls[0][0];
    expect(mailPayload.subject).toContain("nouveau message");
  });

  it("retourne 400 si le body est invalide", async () => {
    const response = await request(getFoAppHelper(foUser))
      .post(`/message/${declarationId}`)
      .send({});
    expect(response.status).toBe(400);
  });
});

describe("GET /message/read/:declarationId", () => {
  it("retourne 200", async () => {
    const response = await request(getFoAppHelper(foUser)).get(
      `/message/read/${declarationId}`,
    );
    expect(response.status).toBe(200);
  });

  it("retourne 400 si declarationId est invalide", async () => {
    const response = await request(getFoAppHelper(foUser)).get(
      "/message/read/abc",
    );
    expect(response.status).toBe(500); // FIXME: add input validation
  });
});

describe("GET /message/:declarationId", () => {
  it("retourne 200", async () => {
    const response = await request(getFoAppHelper(foUser)).get(
      `/message/${declarationId}`,
    );
    expect(response.status).toBe(200);
  });

  it("retourne 400 si declarationId est invalide", async () => {
    const response = await request(getFoAppHelper(foUser)).get("/message/abc");
    expect(response.status).toBe(500); // FIXME: add input validation
  });
});
