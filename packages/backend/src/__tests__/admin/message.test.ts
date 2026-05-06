import { NextFunction, Response } from "express";
import request from "supertest";

import app from "../../app";
import boCheckJWT from "../../middlewares/bo-check-JWT";
import { User, UserRequest } from "../../types/request";
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

jest.mock("../../middlewares/bo-check-JWT", () => jest.fn());
jest.mock("../../services/mail", () => ({
  mailService: { send: jest.fn() },
}));

const boCheckJWTMock = boCheckJWT as unknown as jest.Mock;

let boUserID = 0;
let declarationId = 0;

beforeAll(async () => {
  await createTestContainer();
  const foUser = await createUsagersUserValide();
  const boUser = await createAdminUserValide();
  boUserID = boUser.id;
  const organismeId = await createOrganisme({ userId: foUser.id });
  declarationId = await createDemandeSejour({ organismeId });
  await createHebergement({ declarationId, organismeId });
});

afterAll(async () => {
  await removeTestContainer();
});

beforeEach(() => {
  jest.clearAllMocks();
  boCheckJWTMock.mockImplementation(
    (req: UserRequest, _res: Response, next: NextFunction) => {
      req.decoded = {
        id: boUserID,
        roles: ["DemandeSejour_Lecture", "DemandeSejour_Ecriture"],
        territoireCode: "FRA",
      } as unknown as User;
      next();
    },
  );
});

describe("POST /message/admin/:declarationId", () => {
  it("retourne 200", async () => {
    const response = await request(app)
      .post(`/message/admin/${declarationId}`)
      .send({
        message: "Message BO valide",
      });
    expect(response.status).toBe(200);
  });

  it("retourne 400 si le body est invalide", async () => {
    const response = await request(app)
      .post(`/message/admin/${declarationId}`)
      .send({});
    expect(response.status).toBe(400);
  });
});

describe("GET /message/admin/read/:declarationId", () => {
  it("retourne 200", async () => {
    const response = await request(app).get(
      `/message/admin/read/${declarationId}`,
    );
    expect(response.status).toBe(200);
  });

  it("retourne 400 si declarationId est invalide", async () => {
    const response = await request(app).get("/message/admin/read/abc");
    expect(response.status).toBe(400);
  });
});

describe("GET /message/admin/:declarationId", () => {
  it("retourne 200", async () => {
    const response = await request(app).get(`/message/admin/${declarationId}`);
    expect(response.status).toBe(200);
  });

  it("retourne 400 si declarationId est invalide", async () => {
    const response = await request(app).get("/message/admin/abc");
    expect(response.status).toBe(400);
  });
});
