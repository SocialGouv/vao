import type { NextFunction, Response } from "express";
import request from "supertest";

import app from "../../app";
import { User, UserRequest } from "../../types/request";
import { buildAgrementFixture } from "../helper/fixtures/agrementsFixture";
import { createAgrement } from "../helper/fixtures/agrementsHelper";
import { createOrganisme } from "../helper/fixtures/organismeHelper";
import { createTerritoire } from "../helper/fixtures/territoireHelper";
import { createUsagersUser } from "../helper/fixtures/userHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helper/testContainer";

let authUser = { id: 1, role: "admin" };

jest.mock("../../middlewares/common/checkJWT", () => {
  return async (req: UserRequest, res: Response, next: NextFunction) => {
    req.decoded = authUser as unknown as User;
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
    const territoireId = await createTerritoire({
      territoireCode: "IDF",
    });
    const response = await request(app).get(
      `/territoire/get-by-agrement-region-user`,
    );
    expect(response.status).toBe(200);
    expect(response.body.territoire.territoire_id).toEqual(territoireId);
  });
});
