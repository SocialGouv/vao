import request from "supertest";

import app from "../../app";
import { buildAgrementFixture } from "../helper/fixtures/agrementsFixture";
import {
  createAgrement,
  getAgrement,
} from "../helper/fixtures/agrementsHelper";
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

beforeAll(async () => await createTestContainer());
afterAll(async () => await removeTestContainer());

describe("GET /agrements/organisme/:id", () => {
  it("devrait retourner un agrément par ID de l'organisme avec succès", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const agrementData = await buildAgrementFixture({ organismeId });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
    });
    const response = await request(app).get(
      `/agrements/organisme/${organismeId}`,
    );

    // Vérification des résultats
    expect(response.status).toBe(200);
    expect(response.body.agrement).not.toBeNull();
    expect(response.body.agrement.id).toEqual(agrementId);
  });
  it("devrait retourner une erreur", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const agrementData = await buildAgrementFixture({ organismeId });
    await createAgrement({
      agrement: agrementData,
      organismeId,
    });
    const response = await request(app).get(`/agrements/organisme/invalid`);

    // Vérification des résultats
    // TODO ACH Problème sur le params string. Devrait retourner une 400
    expect(response.status).toBe(403);
  });
  it("devrait retourner un agrement introuvable", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const response = await request(app).get(
      `/agrements/organisme/${organismeId}`,
    );

    // Vérification des résultats
    expect(response.status).toBe(404);
  });
});
describe("POST /agrements", () => {
  it("devrait créer un agrément (POST /agrements)", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const agrementData = await buildAgrementFixture({ organismeId });

    const response = await request(app).post(`/agrements/`).send(agrementData);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });
  it("devrait mettre à jour un agrément (POST /agrements)", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const agrementData = await buildAgrementFixture({ organismeId });
    await createAgrement({ agrement: agrementData, organismeId });
    const { agrement } = await getAgrement(organismeId);
    const response = await request(app).post(`/agrements/`).send(agrement);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });
});
