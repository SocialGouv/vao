import { STATUS_USER_FRONT } from "@vao/shared-bridge";
import request from "supertest";

import { roles } from "../../helpers/users";
import { mailService } from "../../services/mail";
import { link as linkOrganisme } from "../../services/Organisme";
import { UsersRepository } from "../../usagers/users/users.repository";
import { getFoAppHelper } from "../helpers/appHelper";
import {
  createOrganisme,
  generateRandomSiret,
} from "../helpers/organismeHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helpers/testContainer";
import {
  createUsagersUser,
  createUsagersUserValide,
} from "../helpers/userHelper";

jest.mock("../../services/mail", () => ({
  mailService: { send: jest.fn() },
}));

beforeAll(async () => {
  await createTestContainer();
});

afterAll(async () => {
  await removeTestContainer();
});

beforeEach(() => {
  jest.clearAllMocks();
  (mailService.send as jest.Mock).mockResolvedValue(undefined);
});

describe("Domaine /fo-user", () => {
  describe("GET /fo-user/get-roles/", () => {
    it("retourne 500 (UnexpectedError) avec la stack actuelle", async () => {
      const user = await createUsagersUser();
      const response = await request(getFoAppHelper({ id: user.id })).get(
        "/fo-user/get-roles/",
      );

      expect(response.status).toBe(500);
      expect(response.body.name).toBe("UnexpectedError");
    });
  });

  describe("POST /fo-user/change-status/:userId", () => {
    it("retourne 200 et met à jour le statut avec historique", async () => {
      const actor = await createUsagersUser({
        statusCode: STATUS_USER_FRONT.VALIDATED,
      });
      const orgId = await createOrganisme({ userId: actor.id });

      const stamp = Date.now();
      const { user: created } = await UsersRepository.create({
        user: {
          email: `cible-change-status-${stamp}@example.com`,
          nom: "Cible",
          password: "Motdepassevalid1!",
          prenom: "Statut",
          siret: generateRandomSiret(),
          status_code: STATUS_USER_FRONT.BLOCKED,
          telephone: "0102030405",
          ter_code: "FRA",
        },
      });
      const target = created[0];
      await linkOrganisme(target.id, orgId);
      const response = await request(getFoAppHelper({ id: actor.id }))
        .post(`/fo-user/change-status/${target.id}`)
        .query({ status: STATUS_USER_FRONT.VALIDATED })
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Status updated");
    });

    it("retourne 400 quand le statut est invalide", async () => {
      const actor = await createUsagersUser({
        statusCode: STATUS_USER_FRONT.VALIDATED,
      });
      const response = await request(getFoAppHelper({ id: actor.id }))
        .post("/fo-user/change-status/1")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.name).toBe("AppError");
    });

    it("retourne 200 et envoie le mail de désactivation lors du blocage", async () => {
      const actor = await createUsagersUser({
        statusCode: STATUS_USER_FRONT.VALIDATED,
      });
      const orgId = await createOrganisme({ userId: actor.id });
      const stamp = Date.now();

      const { user: secondUserCreated } = await UsersRepository.create({
        user: {
          email: `second-user-${stamp}@example.com`,
          nom: "Second",
          password: "Motdepassevalid1!",
          prenom: "User",
          siret: generateRandomSiret(),
          status_code: STATUS_USER_FRONT.VALIDATED,
          telephone: "0102030405",
          ter_code: "FRA",
        },
      });
      const target = secondUserCreated[0];
      await linkOrganisme(target.id, orgId);
      const response = await request(getFoAppHelper({ id: actor.id }))
        .post(`/fo-user/change-status/${target.id}`)
        .query({ status: STATUS_USER_FRONT.BLOCKED })
        .send({});

      expect(response.status).toBe(200);
      expect(mailService.send).toHaveBeenCalledTimes(1);
      const mailPayload = (mailService.send as jest.Mock).mock.calls[0][0];
      expect(mailPayload.to).toBe(target.email);
      expect(mailPayload.subject).toContain("DESACTIVATION");
    });
  });

  describe("POST /fo-user/accept-cgu", () => {
    it("retourne 409 sans session", async () => {
      const response = await request(getFoAppHelper())
        .post("/fo-user/accept-cgu")
        .send({});

      expect(response.status).toBe(409);
    });
  });

  describe("GET /fo-user/get-one/:userId", () => {
    it("retourne 200 avec le détail utilisateur", async () => {
      const user = await createUsagersUser();
      await createOrganisme({ userId: user.id });
      const response = await request(getFoAppHelper({ id: user.id })).get(
        `/fo-user/get-one/${user.id}`,
      );

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
    });
  });

  describe("GET /fo-user/list", () => {
    it("retourne 200 avec users et total", async () => {
      const user = await createUsagersUser();
      const response = await request(getFoAppHelper({ id: user.id })).get(
        "/fo-user/list",
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("users");
      expect(response.body).toHaveProperty("total");
    });
  });

  describe("GET /fo-user/get-by-organisme", () => {
    it("retourne 200 avec les utilisateurs de l'organisme", async () => {
      const user = await createUsagersUser();
      await createOrganisme({ userId: user.id });
      const response = await request(getFoAppHelper({ id: user.id })).get(
        "/fo-user/get-by-organisme",
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("users");
      expect(response.body).toHaveProperty("total");
    });
  });

  describe("POST /fo-user/roles/:userId", () => {
    it("retourne 200 et met à jour les rôles", async () => {
      const user = await createUsagersUserValide({
        roles: [roles.EIG_ECRITURE],
        status_code: STATUS_USER_FRONT.VALIDATED,
      });
      await createOrganisme({ userId: user.id });
      const response = await request(getFoAppHelper({ id: user.id }))
        .post(`/fo-user/roles/${user.id}`)
        .send({ roles: [] });

      expect(response.status).toBe(200);
      expect(response.body.userRole).toBeDefined();
    });
  });

  describe("POST /fo-user/update-status/:userId", () => {
    it("retourne 200 et envoie l'email (source FO)", async () => {
      const actor = await createUsagersUser({
        statusCode: STATUS_USER_FRONT.VALIDATED,
      });
      const orgId = await createOrganisme({ userId: actor.id });
      const cible = await createUsagersUser({
        statusCode: STATUS_USER_FRONT.NEED_SIRET_VALIDATION,
      });
      await linkOrganisme(cible.id, orgId);
      const response = await request(getFoAppHelper({ id: actor.id }))
        .post(`/fo-user/update-status/${cible.id}`)
        .query({ status: STATUS_USER_FRONT.VALIDATED })
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Email sent");
    });

    it("retourne 200 et envoie le mail de refus organisme", async () => {
      const actor = await createUsagersUser({
        statusCode: STATUS_USER_FRONT.VALIDATED,
      });
      const orgId = await createOrganisme({ userId: actor.id });
      const cible = await createUsagersUser({
        statusCode: STATUS_USER_FRONT.NEED_SIRET_VALIDATION,
      });
      await linkOrganisme(cible.id, orgId);
      const response = await request(getFoAppHelper({ id: actor.id }))
        .post(`/fo-user/update-status/${cible.id}`)
        .query({
          motif: "Non reconnu par l'organisme",
          status: STATUS_USER_FRONT.BLOCKED,
        })
        .send({});

      expect(response.status).toBe(200);
      expect(mailService.send).toHaveBeenCalledTimes(1);
      const mailPayload = (mailService.send as jest.Mock).mock.calls[0][0];
      expect(mailPayload.subject).toContain("Refus d’inscription");
    });
  });
});
