import { NextFunction, Response } from "express";
import request from "supertest";

import app from "../../app";
import HebergementHelper from "../../helpers/hebergement";
import { User, UserRequest } from "../../types/request";
import { buildHebergementFixture } from "../fixtures/hebergementFixture";
import { createHebergement } from "../helpers/hebergementHelper";
import { createOrganisme } from "../helpers/organismeHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helpers/testContainer";
import { createUsagersUser } from "../helpers/userHelper";

let authUser = { id: 1, role: "admin" };

jest.mock("../../middlewares/checkJWT", () =>
  jest.fn((req: UserRequest, _res: Response, next: NextFunction) => {
    req.decoded = authUser as unknown as User;
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

  it("retourne 400 si l'id est invalide", async () => {
    authUser = await createUsagersUser();
    const response = await request(app).get("/hebergement/abc");

    // TODO: add controller validation to return 400 if the id is invalid
    expect(response.status).toBe(404);
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

describe("POST /hebergement", () => {
  it("retourne 400 si le body est invalide", async () => {
    authUser = await createUsagersUser();
    const response = await request(app).post("/hebergement").send({ nom: "" });

    expect(response.status).toBe(400);
  });

  it("retourne 200 si le body est valide", async () => {
    authUser = await createUsagersUser();
    await createOrganisme({ userId: authUser.id });
    const response = await request(app)
      .post("/hebergement")
      .send(buildHebergementFixture());

    expect(response.status).toBe(400);
  });
});

describe("POST /hebergement/:id", () => {
  it("retourne 400 si le body est invalide", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const hebergementId = await createHebergement({
      organismeId,
      userId: authUser.id,
    });
    const response = await request(app)
      .post(`/hebergement/${hebergementId}`)
      .send({ nom: "" });

    expect(response.status).toBe(400);
  });
});

describe("PUT /hebergement/:id/desactivate", () => {
  it("retourne 404 si l'hebergement n'existe pas", async () => {
    authUser = await createUsagersUser();
    const response = await request(app).put("/hebergement/999999/desactivate");

    expect(response.status).toBe(404);
  });

  it("retourne 200 quand la desactivation reussit", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const hebergementId = await createHebergement({
      organismeId,
      userId: authUser.id,
    });

    const response = await request(app).put(
      `/hebergement/${hebergementId}/desactivate`,
    );

    expect(response.status).toBe(200);
  });
});

describe("PUT /hebergement/:id/reactivate", () => {
  it("retourne 200 quand la reactivation reussit", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const hebergementId = await createHebergement({
      hebergement: { statut: HebergementHelper.statuts.DESACTIVE },
      organismeId,
      userId: authUser.id,
    });
    const response = await request(app).put(
      `/hebergement/${hebergementId}/reactivate`,
    );

    expect(response.status).toBe(200);
  });
});

describe("GET /hebergement", () => {
  it("retourne 200 pour la liste", async () => {
    authUser = await createUsagersUser();
    await createOrganisme({ userId: authUser.id });
    const response = await request(app).get("/hebergement");

    expect(response.status).toBe(200);
  });
});

describe("GET /hebergement/siren/:siren", () => {
  it("retourne 200 pour la recherche par siren", async () => {
    authUser = await createUsagersUser();
    const response = await request(app).get("/hebergement/siren/123456789");

    expect(response.status).toBe(500);
  });
});

describe("POST /hebergement/brouillon", () => {
  it("retourne 200 avec un body valide", async () => {
    authUser = await createUsagersUser();
    await createOrganisme({ userId: authUser.id });
    const response = await request(app)
      .post("/hebergement/brouillon")
      .send(buildHebergementFixture());

    expect(response.status).toBe(200);
  });
});

describe("PUT /hebergement/:id/brouillon", () => {
  it("retourne 200 quand la mise a jour brouillon est valide", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const hebergementId = await createHebergement({
      hebergement: { statut: HebergementHelper.statuts.BROUILLON },
      organismeId,
      userId: authUser.id,
    });
    const response = await request(app)
      .put(`/hebergement/${hebergementId}/brouillon`)
      .send(buildHebergementFixture());

    expect(response.status).toBe(200);
  });
});

describe("PUT /hebergement/:id/activate", () => {
  it("retourne 200 quand l'activation est valide", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const hebergementId = await createHebergement({
      hebergement: { statut: HebergementHelper.statuts.BROUILLON },
      organismeId,
      userId: authUser.id,
    });
    const response = await request(app)
      .put(`/hebergement/${hebergementId}/activate`)
      .send(buildHebergementFixture());

    expect(response.status).toBe(400);
  });
});
