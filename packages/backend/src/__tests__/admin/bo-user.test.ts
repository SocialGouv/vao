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

beforeAll(async () => {
  await createTestContainer();
});

afterAll(async () => {
  await removeTestContainer();
});

describe("Domaine /bo-user", () => {
  describe("GET /bo-user", () => {
    it("retourne 200 avec la liste des utilisateurs BO", async () => {
      const adminUser = await createAdminUserValide();

      (checkJwt as jest.Mock).mockImplementation((req, _res, next) => {
        req.decoded = { id: adminUser.id, roles: ["Compte"] };
        next();
      });
      const response = await request(app).get("/bo-user");

      expect(response.status).toBe(200);
    });
  });

  describe("GET /bo-user/me", () => {
    it("retourne 200 avec l'utilisateur courant et ses feature flags", async () => {
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

  describe("POST /bo-user/me", () => {
    it("retourne 400 sans contexte JWT valide (decoded manquant)", async () => {
      const response = await request(app).post("/bo-user/me").send({});
      expect(response.status).toBe(400);
    });

    it("retourne 200 et met à jour le profil avec historique BO", async () => {
      const adminUser = await createAdminUserValide();

      (checkJwt as jest.Mock).mockImplementation((req, _res, next) => {
        req.decoded = { id: adminUser.id };
        next();
      });

      const response = await request(app)
        .post("/bo-user/me")
        .send({
          nom: "NomMisAJourTracking",
          prenom: adminUser.prenom ?? "Prenom",
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Utilisateur mis à jour");
    });
  });

  describe("POST /bo-user/accept-cgu", () => {
    it("retourne 403 sans utilisateur authentifié (JWT sans CGU)", async () => {
      const response = await request(app).post("/bo-user/accept-cgu").send({});

      expect(response.status).toBe(403);
    });
  });

  describe("GET /bo-user/extract", () => {
    it("retourne 200 avec un export CSV", async () => {
      const adminUser = await createAdminUserValide();

      (checkJwt as jest.Mock).mockImplementation((req, _res, next) => {
        req.decoded = {
          id: adminUser.id,
          roles: ["Compte"],
          territoireCode: "FRA",
        } as unknown as User;
        next();
      });

      const response = await request(app).get("/bo-user/extract");

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("text/csv");
    });
  });

  describe("GET /bo-user/territoires/:territoireCode", () => {
    it("retourne 200 avec les utilisateurs du territoire", async () => {
      const adminUser = await createAdminUserValide();

      (checkJwt as jest.Mock).mockImplementation((req, _res, next) => {
        req.decoded = {
          id: adminUser.id,
          roles: ["Compte"],
          territoireCode: "FRA",
        } as unknown as User;
        next();
      });

      const response = await request(app).get("/bo-user/territoires/FRA");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.users)).toBe(true);
    });
  });

  describe("GET /bo-user/:userId", () => {
    it("retourne 200 avec le détail de l'utilisateur", async () => {
      const adminUser = await createAdminUserValide();

      (checkJwt as jest.Mock).mockImplementation((req, _res, next) => {
        req.decoded = {
          id: adminUser.id,
          roles: ["Compte"],
          territoireCode: "FRA",
        } as unknown as User;
        next();
      });

      const response = await request(app).get(`/bo-user/${adminUser.id}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(adminUser.id);
    });

    it("retourne 400 pour un identifiant utilisateur inexistant", async () => {
      const adminUser = await createAdminUserValide();

      (checkJwt as jest.Mock).mockImplementation((req, _res, next) => {
        req.decoded = {
          id: adminUser.id,
          roles: ["Compte"],
          territoireCode: "FRA",
        } as unknown as User;
        next();
      });

      const response = await request(app).get("/bo-user/999999999");

      expect(response.status).toBe(400);
    });
  });

  describe("POST /bo-user", () => {
    it("retourne 400 avec un corps vide (validation)", async () => {
      const adminUser = await createAdminUserValide();

      (checkJwt as jest.Mock).mockImplementation((req, _res, next) => {
        req.decoded = {
          id: adminUser.id,
          roles: ["Compte"],
          territoireCode: "FRA",
        } as unknown as User;
        next();
      });

      const response = await request(app).post("/bo-user").send({});

      expect(response.status).toBe(400);
    });
  });

  describe("POST /bo-user/:userId", () => {
    it("retourne 400 avec un corps vide (validation)", async () => {
      const adminUser = await createAdminUserValide();

      (checkJwt as jest.Mock).mockImplementation((req, _res, next) => {
        req.decoded = {
          id: adminUser.id,
          roles: ["Compte"],
          territoireCode: "FRA",
        } as unknown as User;
        next();
      });

      const response = await request(app)
        .post(`/bo-user/${adminUser.id}`)
        .send({});

      expect(response.status).toBe(400);
    });
  });
});
