import { NextFunction, Response } from "express";
import request from "supertest";

import app from "../../app";
import boCheckJWT from "../../middlewares/bo-check-JWT";
import { User, UserRequest } from "../../types/request";
import {
  createTestContainer,
  removeTestContainer,
} from "../helpers/testContainer";
import {
  createAdminUserValide,
  createUsagersUser,
} from "../helpers/userHelper";

jest.mock("../../middlewares/bo-check-JWT", () => jest.fn());
jest.mock("../../middlewares/checkPermissionBOForUpdateStatusFo", () =>
  jest.fn((_req: UserRequest, _res: Response, next: NextFunction) => next()),
);
jest.mock("../../middlewares/checkPermissionBoForFoStatus", () =>
  jest.fn((_req: UserRequest, _res: Response, next: NextFunction) => next()),
);

let adminBoId = 1;
let adminBoTerCode = "FRA";

beforeAll(async () => {
  await createTestContainer();
  const admin = await createAdminUserValide();
  adminBoId = admin.id;
  adminBoTerCode = admin.territoireCode ?? "FRA";
});

afterAll(async () => {
  await removeTestContainer();
});

beforeEach(() => {
  (boCheckJWT as jest.Mock).mockImplementation(
    (req: UserRequest, _res: Response, next: NextFunction) => {
      req.decoded = {
        id: adminBoId,
        territoireCode: adminBoTerCode,
      } as unknown as User;
      next();
    },
  );
});

describe("Domaine /fo-user (admin)", () => {
  describe("GET /fo-user/admin/list", () => {
    it("retourne 200 avec la liste paginée des utilisateurs FO", async () => {
      const response = await request(app).get("/fo-user/admin/list");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("users");
      expect(response.body).toHaveProperty("total");
      expect(Array.isArray(response.body.users)).toBe(true);
    });
  });

  describe("GET /fo-user/admin/list-to-validate", () => {
    it("retourne 200 avec les comptes à valider", async () => {
      const response = await request(app).get(
        "/fo-user/admin/list-to-validate",
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("users");
      expect(response.body).toHaveProperty("total");
      expect(Array.isArray(response.body.users)).toBe(true);
    });
  });

  describe("POST /fo-user/admin/update-status/:userId", () => {
    it("retourne 200 et envoie l'email (source BO)", async () => {
      const cible = await createUsagersUser();

      const response = await request(app)
        .post(`/fo-user/admin/update-status/${cible.id}`)
        .query({ status: "NEED_SIRET_VALIDATION" })
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Email sent");
    });
  });

  describe("GET /fo-user/admin/extract/", () => {
    it("retourne 200 avec un corps CSV", async () => {
      const response = await request(app).get("/fo-user/admin/extract/");

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("text/csv");
    });
  });
});
