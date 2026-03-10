import { AGREMENT_STATUT } from "@vao/shared-bridge";
import { NextFunction, Response } from "express";
import request from "supertest";

import app from "../../app";
import checkJwt from "../../middlewares/checkJWT";
import { mailService } from "../../services/mail";
import { User, UserRequest } from "../../types/request";
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

jest.mock("../../middlewares/checkJWT", () =>
  jest.fn((req: UserRequest, _res: Response, next: NextFunction) => {
    req.decoded = { id: 1, role: "admin" } as unknown as User;
    next();
  }),
);

beforeAll(async () => await createTestContainer());
afterAll(async () => await removeTestContainer());

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /agrements/organisme/:organismeId", () => {
  it("devrait retourner un agrément par ID de l'organisme avec succès", async () => {
    const authUser = await createUsagersUser();
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
    const authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const agrementData = await buildAgrementFixture({ organismeId });
    await createAgrement({
      agrement: agrementData,
      organismeId,
    });
    const response = await request(app).get(`/agrements/organisme/invalid`);

    // Vérification des résultats
    // TODO ACH Problème sur le params string. Devrait retourner une 400
    expect(response.status).toBe(400);
  });
  it("devrait retourner un agrement introuvable", async () => {
    const adminUser = await createUsagersUser();
    (checkJwt as jest.Mock).mockImplementation((req, _res, next) => {
      req.decoded = { id: adminUser.id };
      next();
    });
    const organismeId = await createOrganisme({ userId: adminUser.id });
    const response = await request(app).get(
      `/agrements/organisme/${organismeId}`,
    );

    // Vérification des résultats
    expect(response.status).toBe(404);
  });
});
describe("POST /agrements", () => {
  it("devrait créer un agrément (POST /agrements)", async () => {
    const adminUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: adminUser.id });
    const agrementData = await buildAgrementFixture({ organismeId });
    (checkJwt as jest.Mock).mockImplementation((req, _res, next) => {
      req.decoded = { id: adminUser.id };
      next();
    });

    const response = await request(app).post(`/agrements/`).send(agrementData);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });
  it("devrait mettre à jour un agrément (POST /agrements)", async () => {
    const adminUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: adminUser.id });
    const agrementData = await buildAgrementFixture({ organismeId });
    await createAgrement({ agrement: agrementData, organismeId });
    (checkJwt as jest.Mock).mockImplementation((req, _res, next) => {
      req.decoded = { id: adminUser.id };
      next();
    });
    const { agrement } = await getAgrement(organismeId);
    const response = await request(app).post(`/agrements/`).send(agrement!);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });
});

it("devrait changer le statut d'un agrément avec succès", async () => {
  const adminUser = await createUsagersUser();
  const organismeId = await createOrganisme({ userId: adminUser.id });
  const agrementData = await buildAgrementFixture({ organismeId });
  const agrementId = await createAgrement({
    agrement: agrementData,
    organismeId,
  });
  (checkJwt as jest.Mock).mockImplementation((req, _res, next) => {
    req.decoded = { id: adminUser.id };
    next();
  });
  const response = await request(app)
    .patch(`/agrements/${agrementId}/statut`)
    .send({ statut: "TRANSMIS" });

  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);

  const { agrement } = await getAgrement(organismeId);
  expect(agrement?.statut).toBe("TRANSMIS");
});

jest.mock("../../services/mail", () => ({
  mailService: { send: jest.fn() },
}));

it("workflow changement statut de l'agrement", async () => {
  const adminUser = await createUsagersUser();
  const organismeId = await createOrganisme({ userId: adminUser.id });
  const agrementData = await buildAgrementFixture({ organismeId });
  const agrementId = await createAgrement({
    agrement: agrementData,
    organismeId,
  });
  (checkJwt as jest.Mock).mockImplementation((req, _res, next) => {
    req.decoded = { id: adminUser.id };
    next();
  });
  const response = await request(app)
    .patch(`/agrements/${agrementId}/statut`)
    .send({ statut: "TRANSMIS" });

  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);

  const { agrement } = await getAgrement(organismeId);
  expect(agrement?.statut).toBe(AGREMENT_STATUT.TRANSMIS);

  expect(mailService.send).toHaveBeenCalledTimes(1);
});
