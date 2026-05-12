import { STATUS_USER_FRONT } from "@vao/shared-bridge";
import request from "supertest";

import { mailService } from "../../services/mail";
import { AppHelperUser, getBoAppHelper } from "../helpers/appHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helpers/testContainer";
import {
  createAdminUserValide,
  createUsagersUser,
} from "../helpers/userHelper";

jest.mock("../../services/mail", () => ({
  mailService: { send: jest.fn() },
}));

let boUser: AppHelperUser;

beforeAll(async () => {
  await createTestContainer();
  boUser = await createAdminUserValide({ ter_code: "IDF" });
  if (!boUser.territoireCode) {
    boUser.territoireCode = "IDF";
  }
});

afterAll(async () => {
  await removeTestContainer();
});

beforeEach(() => {
  jest.clearAllMocks();
  (mailService.send as jest.Mock).mockResolvedValue(undefined);
});

describe("Domaine /fo-user (admin)", () => {
  describe("GET /fo-user/admin/list", () => {
    it("retourne 200 avec la liste paginée des utilisateurs FO", async () => {
      const response = await request(getBoAppHelper(boUser)).get(
        "/fo-user/admin/list",
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("users");
      expect(response.body).toHaveProperty("total");
      expect(Array.isArray(response.body.users)).toBe(true);
    });
  });

  describe("GET /fo-user/admin/list-to-validate", () => {
    it("retourne 200 avec les comptes à valider", async () => {
      const response = await request(getBoAppHelper(boUser)).get(
        "/fo-user/admin/list-to-validate",
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("users");
      expect(response.body).toHaveProperty("total");
      expect(Array.isArray(response.body.users)).toBe(true);
    });
  });

  describe("POST /fo-user/admin/update-status/:userId", () => {
    it("retourne 403 pour un changement de statut non autorisé par le BO", async () => {
      const cible = await createUsagersUser();

      const response = await request(getBoAppHelper(boUser))
        .post(`/fo-user/admin/update-status/${cible.id}`)
        .query({ status: STATUS_USER_FRONT.NEED_SIRET_VALIDATION })
        .send({});

      expect(response.status).toBe(403);
    });

    it("retourne 200 et envoie le mail de validation de compte OVA", async () => {
      const cible = await createUsagersUser({
        statusCode: STATUS_USER_FRONT.NEED_SIRET_VALIDATION,
      });

      const response = await request(getBoAppHelper(boUser))
        .post(`/fo-user/admin/update-status/${cible.id}`)
        .query({ status: STATUS_USER_FRONT.VALIDATED })
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Email sent");
      expect(mailService.send).toHaveBeenCalledTimes(1);
      const mailPayload = (mailService.send as jest.Mock).mock.calls[0][0];
      expect(mailPayload.to).toBe(cible.email);
      expect(mailPayload.subject).toContain("Inscription validée");
    });

    it("retourne 200 et envoie le mail de refus DREETS", async () => {
      const cible = await createUsagersUser({
        statusCode: STATUS_USER_FRONT.NEED_SIRET_VALIDATION,
        terCode: "FRA",
      });

      const response = await request(getBoAppHelper(boUser))
        .post(`/fo-user/admin/update-status/${cible.id}`)
        .query({
          motif: "Dossier incomplet",
          status: STATUS_USER_FRONT.BLOCKED,
        })
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Email sent");
      expect(mailService.send).toHaveBeenCalledTimes(1);
      const mailPayload = (mailService.send as jest.Mock).mock.calls[0][0];
      expect(mailPayload.to).toBe(cible.email);
      expect(mailPayload.subject).toContain("Refus d’inscription");
    });
  });

  describe("GET /fo-user/admin/extract/", () => {
    it("retourne 200 avec un corps CSV", async () => {
      const response = await request(getBoAppHelper(boUser)).get(
        "/fo-user/admin/extract/",
      );

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("text/csv");
    });
  });
});
