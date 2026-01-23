import request from "supertest";

import app from "../../app";
import config from "../../config";
import jwtMiddleware from "../../middlewares/bo-check-JWT-without-CGU";
import { createAdminUserValide } from "../helper/fixtures/userHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helper/testContainer";

const mockJwtMiddleware = jwtMiddleware as jest.Mock;

let user: any;
const userFixtureComplement = { cgu_accepted: false, ter_code: "IDF" };

jest.mock("../../middlewares/bo-check-JWT-without-CGU", () => jest.fn());

beforeAll(async () => {
  await createTestContainer();
  user = await createAdminUserValide(userFixtureComplement);
  config.tokenSecret_BO = require("crypto").randomBytes(32).toString("hex");
});

beforeEach(() => {
  mockJwtMiddleware.mockImplementation((req, res, next) => {
    req.decoded = user[0];
    next();
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(async () => {
  await removeTestContainer();
});

describe("POST /bo-user/accept-cgu/", () => {
  it("devrait retourner un user", async () => {
    const response = await request(app).post("/bo-user/accept-cgu/");

    expect(response.status).toBe(200);
    expect(response.body.user).toHaveProperty("id");
    expect(response.body.user).toHaveProperty("cguAccepted", true);
  });

  it("devrait retourner 403 si pas de decoded", async () => {
    mockJwtMiddleware.mockImplementation((req, res, next) => next());

    const response = await request(app).post("/bo-user/accept-cgu/");
    expect(response.status).toBe(403);
  });
});
