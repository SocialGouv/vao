import { NextFunction } from "express";
import request from "supertest";

import app from "../../app";
import checkJwt from "../../middlewares/bo-check-JWT";
import { User, UserRequest } from "../../types/request";
import { createAdminUserValide } from "../helper/fixtures/userHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helper/testContainer";

jest.mock("../../middlewares/bo-check-JWT", () =>
  jest.fn((req: UserRequest, _res: Response, next: NextFunction) => {
    req.decoded = { id: 1, role: "admin" } as unknown as User;
    next();
  }),
);

beforeAll(async () => {
  await createTestContainer();
});

afterAll(async () => {
  await removeTestContainer();
});

describe("GET /bo-user/me", () => {
  it("devrait retourner le user courant avec ses feature flags", async () => {
    const adminUser = await createAdminUserValide();

    (checkJwt as jest.Mock).mockImplementation((req, _res, next) => {
      req.decoded = { id: adminUser.id };
      next();
    });

    const response = await request(app).get("/bo-user/me");

    expect(response.status).toBe(200);
    expect(response.body.user).toBeDefined();
    expect(response.body.user.id).toBe(adminUser.id);
    expect(response.body.user.featureFlags).toBeDefined();
    expect(typeof response.body.user.featureFlags).toBe("object");
  });
});
