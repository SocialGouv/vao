import { statusUserFront } from "@vao/shared-bridge";
import request from "supertest";

import app from "../../app";
import config from "../../config";
import jwtMiddleware from "../../middlewares/checkJWTWithoutCGU";
import { createUsagersUserValide } from "../helper/fixtures/userHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helper/testContainer";

const mockJwtMiddleware = jwtMiddleware as jest.Mock;
jest.mock("../../middlewares/checkJWTWithoutCGU", () => jest.fn());

let user: any;
const userFixtureComplement = {
  cgu_accepted: false,
  status_code: statusUserFront.NEED_EMAIL_VALIDATION,
};
/*
jest.mock("../../middlewares/checkJWTWithoutCGU", () => {
  return jest.fn((req, res, next) => {
    req.decoded = user[0];
    next();
  });
});
*/
beforeAll(async () => {
  await createTestContainer(userFixtureComplement);
  user = await createUsagersUserValide();
  // Surcharger la clé secrète pour les tests car elle est défini par environnement
  config.tokenSecret_FO = require("crypto").randomBytes(32).toString("hex");
});

beforeEach(() => {
  mockJwtMiddleware.mockImplementation((req, res, next) => {
    req.decoded = user[0];
    next();
  });
});

afterAll(async () => {
  await removeTestContainer();
});
afterEach(() => {
  jest.clearAllMocks();
});

describe("POST /fo-user/accept-cgu/", () => {
  it("devrait retourner un user", async () => {
    const response = await request(app).post(`/fo-user/accept-cgu/`);
    expect(response.status).toBe(200);
  });
  it("devrait retourner 403 si pas de decoded", async () => {
    mockJwtMiddleware.mockImplementation((req, res, next) => next());

    const response = await request(app).post("/fo-user/accept-cgu/");
    expect(response.status).toBe(403);
  });
});
