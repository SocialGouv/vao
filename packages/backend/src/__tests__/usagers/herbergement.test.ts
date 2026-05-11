import request from "supertest";

import app from "../../app";
import { createHebergement } from "../helper/fixtures/hebergementHelper";
import { createOrganisme } from "../helper/fixtures/organismeHelper";
import { createUsagersUser } from "../helper/fixtures/userHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helper/testContainer";

let authUser = { id: 1, role: "admin" };

jest.mock("../../middlewares/common/checkJWT", () => {
  return async (req, res, next) => {
    req.decoded = authUser;
    next();
  };
});

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

describe("PUT /hebergement/:id/desactivate)", () => {
  it("retourne 200 quand l'utilisateur est autorise sur l'hebergement", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const hebergementId = await createHebergement({
      organismeId,
      userId: authUser.id,
    });
    const response = await request(app).put(
      `/hebergement/${hebergementId}/desactivate`,
    );

    expect(response.statusCode).toBe(200);
  });

  it("retourne 403 quand l'utilisateur n'est pas autorise sur l'hebergement", async () => {
    const owner = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: owner.id });
    const hebergementId = await createHebergement({
      organismeId,
      userId: owner.id,
    });
    authUser = await createUsagersUser();
    const response = await request(app).put(
      `/hebergement/${hebergementId}/desactivate`,
    );

    expect(response.statusCode).toBe(403);
  });
});
