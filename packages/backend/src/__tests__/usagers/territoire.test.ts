import request from "supertest";

import app from "../../app";
import { buildAgrementFixture } from "../helper/fixtures/agrementsFixture";
import { createAgrement } from "../helper/fixtures/agrementsHelper";
import { createOrganisme } from "../helper/fixtures/organismeHelper";
import { buildTerritoireFixture } from "../helper/fixtures/territoireHelper";
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

describe("GET /territoire/getByAgrementRegionUser", () => {
  it("devrait retourner un territoire pour l'utilisateur l'agrément avec succès", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const agrementData = await buildAgrementFixture({ organismeId });
    await createAgrement({
      agrement: agrementData,
      organismeId,
    });
    const territoireId = await buildTerritoireFixture({
      territoireCode: "IDF",
    });
    console.log("Territoire ID simulé :", territoireId);
    const response = await request(app).get(
      `/territoire/get-by-agrement-region-user`,
    );
    expect(response.status).toBe(200);
    expect(response.body.territoire.territoire_id).toEqual(territoireId);
  });
});
