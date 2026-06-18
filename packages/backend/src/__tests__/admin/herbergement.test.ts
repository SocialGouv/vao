import request from "supertest";

import { roles } from "../../helpers/users";
import { getBoAppHelper } from "../helpers/appHelper";
import { createHebergement } from "../helpers/hebergementHelper";
import { createOrganisme } from "../helpers/organismeHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helpers/testContainer";
import { createAdminUser, createUsagersUser } from "../helpers/userHelper";

beforeAll(async () => {
  await createTestContainer();
});

afterAll(async () => {
  await removeTestContainer();
});

describe("GET /hebergement/admin/:id", () => {
  it("devrait retourner un hébergement par ID avec succès", async () => {
    const adminUser = await createAdminUser({
      roles: [roles.COMPTE],
      territoireCode: "FRA",
    });
    const foUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: foUser.id });
    const hebergementId = await createHebergement({
      organismeId,
      userId: foUser.id,
    });

    const response = await request(getBoAppHelper(adminUser)).get(
      `/hebergement/admin/${hebergementId}`,
    );

    expect(response.status).toBe(200);
    expect(response.body.hebergement.id).toEqual(hebergementId);
  });

  it("retourne 404 si l'hebergement n'existe pas", async () => {
    const adminUser = await createAdminUser({
      roles: [roles.COMPTE],
      territoireCode: "FRA",
    });

    const response = await request(getBoAppHelper(adminUser)).get(
      "/hebergement/admin/999999",
    );

    expect(response.status).toBe(404);
  });
});

describe("GET /hebergement/admin", () => {
  it("retourne 200 pour la liste admin", async () => {
    const adminUser = await createAdminUser({
      roles: [roles.COMPTE],
      territoireCode: "IDF",
    });

    const response = await request(getBoAppHelper(adminUser)).get(
      "/hebergement/admin/",
    );

    expect(response.status).toBe(200);
  });
});

describe("GET /hebergement/extract", () => {
  it("retourne 200 et un CSV pour l'extract admin", async () => {
    const adminUser = await createAdminUser({
      roles: [roles.COMPTE],
      territoireCode: "IDF",
    });

    const response = await request(getBoAppHelper(adminUser)).get(
      "/hebergement/extract/",
    );

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("text/csv");
  });
});
