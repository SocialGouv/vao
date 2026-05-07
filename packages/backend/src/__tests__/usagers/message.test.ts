import { NextFunction, Response } from "express";
import request from "supertest";

import app from "../../app";
import checkJWT from "../../middlewares/checkJWT";
import { User, UserRequest } from "../../types/request";
import { createDemandeSejour } from "../helpers/demandeSejourHelper";
import { createHebergement } from "../helpers/hebergementHelper";
import { createOrganisme } from "../helpers/organismeHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helpers/testContainer";
import { createUsagersUserValide } from "../helpers/userHelper";

jest.mock("../../middlewares/checkJWT", () => jest.fn());
jest.mock("../../services/mail", () => ({
  mailService: { send: jest.fn() },
}));

const checkJWTMock = checkJWT as unknown as jest.Mock;

let foUserID = 0;
let declarationId = 0;

beforeAll(async () => {
  await createTestContainer();
  const foUser = await createUsagersUserValide();
  foUserID = foUser.id;
  const organismeId = await createOrganisme({ userId: foUserID });
  declarationId = await createDemandeSejour({ organismeId });
  await createHebergement({ declarationId, organismeId });
});

afterAll(async () => {
  await removeTestContainer();
});

beforeEach(() => {
  jest.clearAllMocks();
  checkJWTMock.mockImplementation(
    (req: UserRequest, _res: Response, next: NextFunction) => {
      req.decoded = {
        id: foUserID,
        roles: ["DemandeSejour_Lecture", "DemandeSejour_Ecriture"],
        territoireCode: "FRA",
      } as unknown as User;
      next();
    },
  );
});

describe("POST /message/:declarationId", () => {
  it("retourne 200", async () => {
    const response = await request(app).post(`/message/${declarationId}`).send({
      message: "Message FO valide",
    });
    expect(response.status).toBe(200);
  });

  it("retourne 400 si le body est invalide", async () => {
    const response = await request(app)
      .post(`/message/${declarationId}`)
      .send({});
    expect(response.status).toBe(400);
  });
});

describe("GET /message/read/:declarationId", () => {
  it("retourne 200", async () => {
    const response = await request(app).get(`/message/read/${declarationId}`);
    expect(response.status).toBe(200);
  });

  it("retourne 400 si declarationId est invalide", async () => {
    const response = await request(app).get("/message/read/abc");
    expect(response.status).toBe(500); // FIXME: add input validation
  });
});

describe("GET /message/:declarationId", () => {
  it("retourne 200", async () => {
    const response = await request(app).get(`/message/${declarationId}`);
    expect(response.status).toBe(200);
  });

  it("retourne 400 si declarationId est invalide", async () => {
    const response = await request(app).get("/message/abc");
    expect(response.status).toBe(500); // FIXME: add input validation
  });
});
