import request from "supertest";

import { roles } from "../../helpers/users";
import { getBoAppHelper } from "../helpers/appHelper";
import { createTerritoire } from "../helpers/territoireHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helpers/testContainer";

beforeAll(async () => {
  await createTestContainer();
});

afterAll(async () => {
  await removeTestContainer();
});

describe("GET /territoire/list", () => {
  it("retourne une réponse pour la liste des territoires", async () => {
    const response = await request(
      getBoAppHelper({ id: 1, roles: [roles.COMPTE], territoireCode: "FRA" }),
    ).get("/territoire/list");
    expect(response.status).not.toBe(404);
  });
});

describe("GET /territoire/get-one/:id", () => {
  it("retourne une réponse pour un territoire existant", async () => {
    const territoireId = await createTerritoire({ territoireCode: "FRA" });
    const response = await request(getBoAppHelper()).get(
      `/territoire/get-one/${territoireId}`,
    );
    expect(response.status).not.toBe(404);
  });
});

describe("GET /territoire/get-fiche-id-by-ter-code/:code", () => {
  it("retourne une réponse pour un code territoire", async () => {
    const response = await request(getBoAppHelper()).get(
      "/territoire/get-fiche-id-by-ter-code/FRA",
    );
    expect(response.status).not.toBe(404);
  });
});

describe("PUT /territoire/:id", () => {
  it("retourne une réponse pour la mise à jour d'un territoire", async () => {
    const territoireId = await createTerritoire({ territoireCode: "FRA" });
    const response = await request(getBoAppHelper())
      .put(`/territoire/${territoireId}`)
      .send({});
    expect(response.status).not.toBe(404);
  });
});
