import request from "supertest";

import { roles } from "../../helpers/users";
import { mailService } from "../../services/mail";
import { AppHelperUser, getBoAppHelper } from "../helpers/appHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helpers/testContainer";
import { createAdminUserValide } from "../helpers/userHelper";

jest.mock("../../services/mail", () => ({
  mailService: { send: jest.fn() },
}));

let boUser: AppHelperUser;

beforeAll(async () => {
  await createTestContainer();
  boUser = await createAdminUserValide({
    roles: [roles.COMPTE],
    territoireCode: "FRA",
  });
});

afterAll(async () => {
  await removeTestContainer();
});

beforeEach(() => {
  jest.clearAllMocks();
  (mailService.send as jest.Mock).mockResolvedValue(undefined);
});

describe("Domaine /bo-user", () => {
  describe("GET /bo-user", () => {
    it("retourne 200 avec la liste des utilisateurs BO", async () => {
      const response = await request(getBoAppHelper(boUser)).get("/bo-user");

      expect(response.status).toBe(200);
    });
  });

  describe("GET /bo-user/me", () => {
    it("retourne 200 avec l'utilisateur courant et ses feature flags", async () => {
      const response = await request(getBoAppHelper(boUser)).get("/bo-user/me");

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.id).toBe(boUser.id);
      expect(response.body.user.featureFlags).toBeDefined();
      expect(typeof response.body.user.featureFlags).toBe("object");
    });
  });

  describe("POST /bo-user/me", () => {
    it("retourne 400 sans contexte JWT valide (decoded manquant)", async () => {
      const response = await request(getBoAppHelper())
        .post("/bo-user/me")
        .send({});
      expect(response.status).toBe(400);
    });

    it("retourne 200 et met à jour le profil avec historique BO", async () => {
      const response = await request(getBoAppHelper(boUser))
        .post("/bo-user/me")
        .send({
          nom: "NomMisAJourTracking",
          prenom: boUser.prenom ?? "Prenom",
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Utilisateur mis à jour");
    });
  });

  describe("POST /bo-user/accept-cgu", () => {
    it("retourne 409 sans session", async () => {
      const response = await request(getBoAppHelper())
        .post("/bo-user/accept-cgu")
        .send({});

      expect(response.status).toBe(409);
      expect(response.body.name).toBe("TokenRevoked");
    });
  });

  describe("GET /bo-user/extract", () => {
    it("retourne 200 avec un export CSV", async () => {
      const response = await request(getBoAppHelper(boUser)).get(
        "/bo-user/extract",
      );

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("text/csv");
    });
  });

  describe("GET /bo-user/territoires/:territoireCode", () => {
    it("retourne 200 avec les utilisateurs du territoire", async () => {
      const response = await request(getBoAppHelper(boUser)).get(
        "/bo-user/territoires/FRA",
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.users)).toBe(true);
    });
  });

  describe("GET /bo-user/:userId", () => {
    it("retourne 200 avec le détail de l'utilisateur", async () => {
      const response = await request(getBoAppHelper(boUser)).get(
        `/bo-user/${boUser.id}`,
      );

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(boUser.id);
    });

    it("retourne 400 pour un identifiant utilisateur inexistant", async () => {
      const response = await request(getBoAppHelper(boUser)).get(
        "/bo-user/999999999",
      );

      expect(response.status).toBe(400);
    });
  });

  describe("POST /bo-user", () => {
    it("retourne 400 avec un corps vide (validation)", async () => {
      const response = await request(getBoAppHelper(boUser))
        .post("/bo-user")
        .send({});

      expect(response.status).toBe(400);
    });

    it("retourne 200 et envoie le mail de validation de compte", async () => {
      const stamp = Date.now();
      const email = `bo-create-mail-${stamp}@example.com`;

      const response = await request(getBoAppHelper(boUser))
        .post("/bo-user")
        .send({
          deleted: false,
          email,
          nom: "Nouveau",
          prenom: "Bo",
          roles: [roles.COMPTE],
          territoireCode: "FRA",
        });

      expect(response.status).toBe(200);
      expect(mailService.send).toHaveBeenCalledTimes(1);
      const mailPayload = (mailService.send as jest.Mock).mock.calls[0][0];
      expect(mailPayload.to).toBe(email);
      expect(mailPayload.subject).toContain("Validez votre courriel");
    });
  });

  describe("POST /bo-user/:userId", () => {
    it("retourne 400 avec un corps vide (validation)", async () => {
      const response = await request(getBoAppHelper(boUser))
        .post(`/bo-user/${boUser.id}`)
        .send({});

      expect(response.status).toBe(400);
    });

    it("retourne 200 et envoie le mail de désactivation lors de la suppression logique", async () => {
      const target = await createAdminUserValide({
        email: `bo-delete-mail-${Date.now()}@example.com`,
      });

      const response = await request(getBoAppHelper(boUser))
        .post(`/bo-user/${target.id}`)
        .send({
          deleted: true,
          nom: target.nom,
          prenom: target.prenom,
          roles: [roles.COMPTE],
          territoireCode: "FRA",
        });

      expect(response.status).toBe(200);
      expect(mailService.send).toHaveBeenCalledTimes(1);
      const mailPayload = (mailService.send as jest.Mock).mock.calls[0][0];
      expect(mailPayload.to).toBe(target.email);
      expect(mailPayload.subject).toContain("DESACTIVATION");
    });
  });
});
