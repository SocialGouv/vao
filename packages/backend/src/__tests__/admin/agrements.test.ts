import {
  AGREMENT_HISTORY_TYPE,
  AGREMENT_STATUT,
  AgrementDto,
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

describe("GET /agrements/list/", () => {
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
    const response = await request(app).get(`/admin/agrements/list/`);

    expect(response.status).toBe(200);
    expect(response.body.agrements).toBeDefined();
    expect(response.body.agrements.length).toBe(2);
    expect(response.body.agrements[0].id).toEqual(agrementId1);
    expect(response.body.agrements[1].id).toEqual(agrementId2);
  });

  it("devrait changer le statut d'un agrément avec succès (PATCH /admin/agrements/:id/statut)", async () => {
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
    const listResponse = await request(app).get(`/admin/agrements/list/`);
    const agrement = listResponse.body.agrements.find(
      (a: AgrementDto) => a.id === agrementId,
    );
    expect(agrement.statut).toBe(AGREMENT_STATUT.EN_COURS);
  });

  it("devrait historiser l'événement de prise en charge (PATCH /admin/agrements/:id/statut)", async () => {
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

  it("devrait retourner une 404 si l'agrément n'existe pas (PATCH /admin/agrements/:id/statut)", async () => {
    authUserBo = await createAdminUser({ territoireCode: "IDF" });
    const response = await request(app)
      .patch(`/admin/agrements/999999/statut`)
      .send({ statut: "PRIS_EN_CHARGE" });
    expect(response.status).toBe(404);
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
      `/admin/agrements/list?limit=1&offset=0&search={"numero":"${agrementData.numero}"}`,
    );

    expect(response.status).toBe(200);
    expect(response.body.agrements).toBeDefined();
    expect(response.body.agrements.length).toBe(1);
    expect(response.body.agrements[0].numero).toEqual(agrementData.numero);
  });
});
