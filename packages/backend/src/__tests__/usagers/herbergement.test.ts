import { NextFunction, Response } from "express";
import request from "supertest";

import app from "../../app";
import { User, UserRequest } from "../../types/request";
import { createHebergement } from "../helper/fixtures/hebergementHelper";
import { createOrganisme } from "../helper/fixtures/organismeHelper";
import { createUsagersUser } from "../helper/fixtures/userHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helper/testContainer";

let authUser = { id: 1, role: "admin" };

jest.mock("../../middlewares/checkJWT", () =>
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

describe("GET /hebergement/:id", () => {
  it("devrait retourner un hébergement par ID avec succès", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const hebergementId = await createHebergement({
      organismeId,
      userId: authUser.id,
    });
    const response = await request(app).get(`/hebergement/${hebergementId}`);

    // Vérification des résultats
    expect(response.status).toBe(200);
    expect(response.body.hebergement.id).toEqual(hebergementId);
  });
});

describe("POST /hebergement/:id/desactivate - middleware checkPermissionHebergementUser", () => {
  it("devrait retourner une erreur 403 avec le bon message si l'utilisateur n'a pas la permission de désactiver l'hébergement", async () => {
    // Création user A (propriétaire de l'hébergement)
    const userA = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: userA.id });
    const hebergementId = await createHebergement({
      organismeId,
      userId: userA.id,
    });

    console.log("Hebergement ID:", hebergementId);

    // Authentification avec un utilisateur B (qui n'a pas accès)
    authUser = await createUsagersUser();
    const response = await request(app).put(
      `/hebergement/${hebergementId}/desactivate`,
    );

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      "Utilisateur non autorisé à modifier cet hébergement",
    );
  });
});
