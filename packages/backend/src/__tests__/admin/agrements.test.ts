import request from "supertest";

import app from "../../app";
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
  return async (req, res, next) => {
    req.decoded = authUserBo;
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
