import request from "supertest";

import { roles } from "../../helpers/users";
import { getPool } from "../../utils/pgpool";
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

describe("GET /admin/hebergement/:id", () => {
  it("devrait retourner un hébergement actif par ID avec succès", async () => {
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
      `/admin/hebergement/${hebergementId}`,
    );

    expect(response.status).toBe(200);
    expect(response.body.hebergement.id).toBe(hebergementId);
    expect(response.body.hebergement.statut).toBe("actif");

    const { rows } = await getPool().query(
      `SELECT "current", statut_id, organisme_id
       FROM front.hebergement
       WHERE id = $1`,
      [hebergementId],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].current).toBe(true);
    expect(rows[0].organisme_id).toBe(organismeId);
  });

  it("retourne 404 si l'hébergement n'existe pas", async () => {
    const adminUser = await createAdminUser({
      roles: [roles.COMPTE],
      territoireCode: "FRA",
    });

    const response = await request(getBoAppHelper(adminUser)).get(
      "/admin/hebergement/999999",
    );

    expect(response.status).toBe(404);
  });
});

describe("GET /admin/hebergement", () => {
  it("retourne les hébergements actifs filtrés par les départements de l'admin", async () => {
    const adminUser = await createAdminUser({
      roles: [roles.COMPTE],
      territoireCode: "IDF",
    });
    const foUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: foUser.id });
    const hebergementId = await createHebergement({
      organismeId,
      userId: foUser.id,
    });

    const response = await request(getBoAppHelper(adminUser)).get(
      "/admin/hebergement/",
    );

    expect(response.status).toBe(200);
    expect(response.body.rows).toBeDefined();
    expect(response.body.total).toBeGreaterThanOrEqual(1);
    expect(response.body.rows.map((row: { id: number }) => row.id)).toContain(
      hebergementId,
    );

    const { rows } = await getPool().query(
      `SELECT departement
       FROM front.adresse a
       JOIN front.hebergement h ON h.adresse_id = a.id
       WHERE h.id = $1 AND h."current" IS TRUE`,
      [hebergementId],
    );
    expect(rows[0].departement).toBe("75");
  });
});

describe("GET /admin/hebergement/extract", () => {
  it("retourne 200 et un CSV pour l'extract admin", async () => {
    const adminUser = await createAdminUser({
      roles: [roles.COMPTE],
      territoireCode: "IDF",
    });
    const foUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: foUser.id });
    await createHebergement({
      organismeId,
      userId: foUser.id,
    });

    const response = await request(getBoAppHelper(adminUser)).get(
      "/admin/hebergement/extract",
    );

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("text/csv");
    expect(response.text).toContain("Nom de l'hébergement");
    expect(response.text).toContain("Hebergement fixture");
  });
});
