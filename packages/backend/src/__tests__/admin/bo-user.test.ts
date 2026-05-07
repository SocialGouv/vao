import { NextFunction, Response } from "express";
import request from "supertest";

import app from "../../app";
import checkJwt from "../../middlewares/bo-check-JWT";
import { User, UserRequest } from "../../types/request";
import {
  createTestContainer,
  removeTestContainer,
} from "../helpers/testContainer";
import { createAdminUserValide } from "../helpers/userHelper";

jest.mock("../../middlewares/bo-check-JWT", () =>
  jest.fn((req: UserRequest, _res: Response, next: NextFunction) => {
    req.decoded = { id: 1, role: "admin" } as unknown as User;
    next();
  }),
);
jest.mock("../../middlewares/bo-check-JWT-without-CGU", () => ({
  __esModule: true,
  default: jest.fn((_req: UserRequest, _res: Response, next: NextFunction) =>
    next(),
  ),
}));
jest.mock("../../middlewares/bo-check-role", () =>
  jest.fn(
    () => (_req: UserRequest, _res: Response, next: NextFunction) => next(),
  ),
);
jest.mock("../../middlewares/bo-check-terr-for-account-creation", () =>
  jest.fn((_req: UserRequest, _res: Response, next: NextFunction) => next()),
);
jest.mock("../../middlewares/getDepartements", () =>
  jest.fn((req: UserRequest, _res: Response, next: NextFunction) => {
    req.departements = [{ value: "75" }] as never;
    next();
  }),
);
jest.mock("../../middlewares/trackBoUser", () =>
  jest.fn(
    () => (_req: UserRequest, _res: Response, next: NextFunction) => next(),
  ),
);

beforeAll(async () => {
  await createTestContainer();
});

afterAll(async () => {
  await removeTestContainer();
});

describe("Domaine /bo-user", () => {
  it("GET /bo-user retourne une liste", async () => {
    const adminUser = await createAdminUserValide();

    (checkJwt as jest.Mock).mockImplementation((req, _res, next) => {
      req.decoded = { id: adminUser.id, roles: ["Compte"] };
      next();
    });
    const response = await request(app).get("/bo-user");

    expect(response.status).toBe(200);
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

  it("couvre les autres endpoints /bo-user", async () => {
    const responses = await Promise.all([
      request(app).post("/bo-user/accept-cgu").send({}),
      request(app).get("/bo-user/extract"),
      request(app).get("/bo-user/territoires/FRA"),
      request(app).get("/bo-user/1"),
      request(app).post("/bo-user/me").send({}),
      request(app).post("/bo-user").send({}),
      request(app).post("/bo-user/1").send({}),
      request(app).get("/bo-user/FRA"),
    ]);

    responses.forEach((response) => {
      expect(response.status).not.toBe(404);
    });
  });
});
