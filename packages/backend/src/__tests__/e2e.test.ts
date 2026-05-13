import request from "supertest";

import app from "../app";
import { createOrganisme } from "./helpers/organismeHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "./helpers/testContainer";
import {
  createAdminUserValide,
  createUsagersUserValide,
} from "./helpers/userHelper";

beforeAll(async () => {
  await createTestContainer({ withSeeds: true });
});

afterAll(async () => {
  await removeTestContainer();
});

describe("POST /e2e/reset", () => {
  it("retourne un statut 200 quand la route est activée", async () => {
    const usager = await createUsagersUserValide({
      email: "e2e-test@example.com",
    });
    await createOrganisme({ userId: usager.id });
    createAdminUserValide({ email: "tnra-test@example.com" });
    let response = await request(app).post("/e2e/reset");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      deletedOrganismesCount: 1,
      deletedUsersCount: 1,
      deletedUsersForcedCount: 0,
      insertedUserCount: 0,
    });

    response = await request(app).post("/e2e/reset");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      deletedOrganismesCount: 0,
      deletedUsersCount: 0,
      deletedUsersForcedCount: 0,
      insertedUserCount: 0,
    });
  });
});
