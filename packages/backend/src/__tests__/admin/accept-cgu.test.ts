import request from "supertest";

import app from "../../app";
import checkJWTWithoutCGU from "../../middlewares/bo-check-JWT-without-CGU";
import { createAdminUserValide } from "../helper/fixtures/userHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helper/testContainer";

jest.mock("../../middlewares/bo-check-JWT-without-CGU", () => ({
  __esModule: true,
  default: jest.fn((req, res, next) => next()),
}));

const userFixtureComplement = { cgu_accepted: false, ter_code: "IDF" };

beforeAll(async () => {
  await createTestContainer();
});

afterAll(async () => {
  await removeTestContainer();
});

describe("POST /bo-user/accept-cgu/", () => {
  it("devrait retourner un user", async () => {
    const adminUser = await createAdminUserValide(userFixtureComplement);
    (checkJWTWithoutCGU as jest.Mock).mockImplementation((req, res, next) => {
      req.decoded = adminUser;
      next();
    });
    const response = await request(app).post("/bo-user/accept-cgu/");

    expect(response.status).toBe(200);
    expect(response.body.user).toHaveProperty("id");
    expect(response.body.user).toHaveProperty("cguAccepted", true);
  });

  it("devrait retourner 403 si pas de decoded", async () => {
    (checkJWTWithoutCGU as jest.Mock).mockImplementation((req, res, next) =>
      next(),
    );

    const response = await request(app).post("/bo-user/accept-cgu/");
    expect(response.status).toBe(403);
  });
});
