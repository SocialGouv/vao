import request from "supertest";

import { getBoAppHelper } from "../helpers/appHelper";
import { createOrganisme } from "../helpers/organismeHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helpers/testContainer";
import { createUsagersUser } from "../helpers/userHelper";

let boFixtureOrganismeId: number;

beforeAll(async () => {
  await createTestContainer();
  const foUser = await createUsagersUser();
  boFixtureOrganismeId = await createOrganisme({ userId: foUser.id });
});

afterAll(async () => {
  await removeTestContainer();
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /organisme/bo/liste", () => {
  it("retourne 200 avec pagination", async () => {
    const response = await request(
      getBoAppHelper({ id: 1, territoireCode: "FRA" }),
    ).get("/organisme/bo/liste");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("rows");
    expect(response.body).toHaveProperty("total");
    expect(Array.isArray(response.body.rows)).toBe(true);
    expect(typeof response.body.total).toBe("number");
  });
});

describe("GET /organisme/bo/nonagrees", () => {
  it("retourne 200 avec une liste d'organismes", async () => {
    const response = await request(getBoAppHelper()).get(
      "/organisme/bo/nonagrees",
    );

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("organismes");
    expect(Array.isArray(response.body.organismes)).toBe(true);
  });
});

describe("GET /organisme/bo/:organismeId", () => {
  it("retourne 200 et l'organisme pour un id existant", async () => {
    const response = await request(getBoAppHelper()).get(
      `/organisme/bo/${boFixtureOrganismeId}`,
    );

    expect(response.status).toBe(200);
    expect(response.body.organisme.organismeId).toBe(boFixtureOrganismeId);
  });
});

describe("GET /organisme/bo/extract", () => {
  it("retourne 200 et un CSV", async () => {
    const response = await request(getBoAppHelper()).get(
      "/organisme/bo/extract",
    );

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("text/csv");
    expect(response.text).toContain('"Type";"Date de modification"');
  });
});
