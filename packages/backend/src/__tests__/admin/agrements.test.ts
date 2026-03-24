import {
  AGREMENT_HISTORY_TYPE,
  AGREMENT_STATUT,
  AgrementDto,
  FUNCTIONAL_ERRORS,
} from "@vao/shared-bridge";
import { NextFunction, Response } from "express";
import request from "supertest";

import { AgrementService } from "../../admin/agrements/agrements.service";
import app from "../../app";
import { User, UserRequest } from "../../types/request";
import { buildAgrementFixture } from "../helper/fixtures/agrementsFixture";
import { createAgrement } from "../helper/fixtures/agrementsHelper";
import { createOrganisme } from "../helper/fixtures/organismeHelper";
import {
  createAdminUser,
  createUsagersUser,
} from "../helper/fixtures/userHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helper/testContainer";

let authUser = { id: 1, role: "admin" };
let authUser2 = { id: 2, role: "admin" };
let authUserBo = { territoireCode: "IDF" };

jest.mock("../../middlewares/common/checkJWT", () => {
  return async (req: UserRequest, res: Response, next: NextFunction) => {
    req.decoded = authUserBo as unknown as User;
    next();
  };
});

beforeAll(async () => await createTestContainer());
afterAll(async () => await removeTestContainer());

afterEach(() => {
  jest.clearAllMocks();
});

describe("GET /admin/agrements", () => {
  it("devrait retourner une liste d'agréments avec succès", async () => {
    authUser = await createUsagersUser();
    const organismeId1 = await createOrganisme({ userId: authUser.id });
    const agrementData = await buildAgrementFixture({
      organismeId: organismeId1,
    });
    const agrementId1 = await createAgrement({
      agrement: agrementData,
      organismeId: organismeId1,
    });
    authUser2 = await createUsagersUser();
    const organismeId2 = await createOrganisme({ userId: authUser2.id });
    const agrementData2 = await buildAgrementFixture({
      organismeId: organismeId2,
    });
    const agrementId2 = await createAgrement({
      agrement: agrementData2,
      organismeId: organismeId2,
    });
    authUserBo = await createAdminUser({ territoireCode: "IDF" });
    const response = await request(app).get(`/admin/agrements`);

    expect(response.status).toBe(200);
    expect(response.body.agrements).toBeDefined();
    expect(response.body.agrements.length).toBe(2);
    expect(response.body.agrements[0].id).toEqual(agrementId1);
    expect(response.body.agrements[1].id).toEqual(agrementId2);
  });

  it("devrait retourner un seul agréments filtré avec succès", async () => {
    authUser = await createUsagersUser();
    const organismeId1 = await createOrganisme({ userId: authUser.id });
    const agrementData = await buildAgrementFixture({
      organismeId: organismeId1,
    });
    await createAgrement({
      agrement: agrementData,
      organismeId: organismeId1,
    });
    authUser2 = await createUsagersUser();
    const organismeId2 = await createOrganisme({ userId: authUser2.id });
    const agrementData2 = await buildAgrementFixture({
      organismeId: organismeId2,
    });
    await createAgrement({
      agrement: agrementData2,
      organismeId: organismeId2,
    });
    authUserBo = await createAdminUser({ territoireCode: "IDF" });
    const response = await request(app).get(
      `/admin/agrements?limit=1&offset=0&search={"numero":"${agrementData.numero}"}`,
    );

    expect(response.status).toBe(200);
    expect(response.body.agrements).toBeDefined();
    expect(response.body.agrements.length).toBe(1);
    expect(response.body.agrements[0].numero).toEqual(agrementData.numero);
  });
});

describe("PATCH /admin/agrements/{idAgrement}/statut", () => {
  it("devrait changer le statut d'un agrément avec succès", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const agrementData = await buildAgrementFixture({ organismeId });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
    });
    authUserBo = await createAdminUser({ territoireCode: "IDF" });

    const response = await request(app)
      .patch(`/admin/agrements/${agrementId}/statut`)
      .send({ statut: AGREMENT_STATUT.EN_COURS });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // Vérifier que le statut a bien changé en base
    const listResponse = await request(app).get(`/admin/agrements`);
    const agrement = listResponse.body.agrements.find(
      (a: AgrementDto) => a.id === agrementId,
    );
    expect(agrement.statut).toBe(AGREMENT_STATUT.EN_COURS);
  });

  it("devrait modifier le statut et historiser", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const agrementData = await buildAgrementFixture({ organismeId });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
    });
    authUserBo = await createAdminUser({ territoireCode: "IDF" });

    const response = await request(app)
      .patch(`/admin/agrements/${agrementId}/statut`)
      .send({
        commentaire: "L'agrément est à modifier",
        file: "",
        statut: AGREMENT_STATUT.A_MODIFIER,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // Vérifier que l'événement a bien été historisé
    const history = await AgrementService.getHistory(agrementId);
    const aModifierEvent = history.find(
      (event) =>
        event.type === AGREMENT_HISTORY_TYPE.STATUT_CHANGE ||
        event.type_precision === AGREMENT_STATUT.A_MODIFIER,
    );

    expect(aModifierEvent).toBeDefined();
    expect(aModifierEvent?.bo_user).toBeDefined();
  });

  it("devrait retourner une 422 si l'agrément n'existe pas", async () => {
    authUserBo = await createAdminUser({ territoireCode: "IDF" });
    const response = await request(app)
      .patch(`/admin/agrements/999999/statut`)
      .send({ statut: "PRIS_EN_CHARGE" });
    expect(response.status).toBe(422);
    expect(response.body.name).toBe(FUNCTIONAL_ERRORS.AGREMENT_NOT_FOUND);
  });

  it("devrait historiser l'événement de prise en charge", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const agrementData = await buildAgrementFixture({ organismeId });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
    });
    authUserBo = await createAdminUser({ territoireCode: "IDF" });

    await request(app)
      .patch(`/admin/agrements/${agrementId}/statut`)
      .send({ statut: AGREMENT_STATUT.EN_COURS });

    // Vérifier que l'événement a bien été historisé
    const history = await AgrementService.getHistory(agrementId);
    const priseEnChargeEvent = history.find(
      (event) =>
        event.type === AGREMENT_HISTORY_TYPE.STATUT_CHANGE ||
        event.type_precision === AGREMENT_STATUT.EN_COURS,
    );
    expect(priseEnChargeEvent).toBeDefined();
    expect(priseEnChargeEvent?.bo_user).toBeDefined();
  });

  it("devrait changer retourner une erreur 400 paramètre manquant", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const agrementData = await buildAgrementFixture({ organismeId });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
    });
    authUserBo = await createAdminUser({ territoireCode: "IDF" });

    const response = await request(app)
      .patch(`/admin/agrements/${agrementId}/statut`)
      .send({ statut: AGREMENT_STATUT.A_MODIFIER });

    expect(response.status).toBe(400);
  });
});

describe("GET /admin/agrements/:id", () => {
  it("devrait retourner un agrément existant avec succès", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const agrementData = await buildAgrementFixture({ organismeId });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
    });
    authUserBo = await createAdminUser({ territoireCode: "IDF" });

    const response = await request(app).get(`/admin/agrements/${agrementId}`);
    expect(response.status).toBe(200);
    expect(response.body.agrement).toBeDefined();
    expect(response.body.agrement.id).toBe(agrementId);
  });

  it("devrait retourner une 404 si l'agrément n'existe pas", async () => {
    authUserBo = await createAdminUser({ territoireCode: "IDF" });
    const response = await request(app).get(`/admin/agrements/999999`);
    expect(response.status).toBe(404);
  });
});

describe("GET /admin/agrements/history/:agrementId", () => {
  it("devrait retourner l'historique d'un agrément existant", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const agrementData = await buildAgrementFixture({ organismeId });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
    });
    authUserBo = await createAdminUser({ territoireCode: "IDF" });
    await request(app)
      .patch(`/admin/agrements/${agrementId}/statut`)
      .send({ statut: AGREMENT_STATUT.EN_COURS });
    const response = await request(app).get(
      `/admin/agrements/history/${agrementId}`,
    );
    expect(response.status).toBe(200);
    expect(response.body.history).toBeDefined();
    expect(Array.isArray(response.body.history)).toBe(true);
    expect(response.body.history.length).toBeGreaterThan(0);
    const event = response.body.history[0];
    expect(event).toHaveProperty("id");
    expect(event).toHaveProperty("agrement_id", agrementId);
    expect(event).toHaveProperty("type");
    expect(event).toHaveProperty("created_at");
  });
  it("devrait retourner un tableau vide si aucun historique", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const agrementData = await buildAgrementFixture({ organismeId });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
    });
    authUserBo = await createAdminUser({ territoireCode: "IDF" });
    const response = await request(app).get(
      `/admin/agrements/history/${agrementId}`,
    );
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.history)).toBe(true);
    expect(response.body.history.length).toBe(0);
  });
  it("devrait retourner 200 et un tableau vide pour un agrément inexistant", async () => {
    authUserBo = await createAdminUser({ territoireCode: "IDF" });
    const response = await request(app).get(`/admin/agrements/history/9999999`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.history)).toBe(true);
    expect(response.body.history.length).toBe(0);
  });
});
