import request from "supertest";

import { getBoAppHelper } from "../helpers/appHelper";
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

describe("Documents static/public controllers", () => {
  describe("GET /documents/admin/static/:name", () => {
    it("devrait retourner le fichier statique d'administration et appeler DocumentService.getStaticFile avec le répertoire static", async () => {
      const response = await request(getBoAppHelper({ id: 1 })).get(
        `/documents/admin/static/agrements_VAO_non_actifs_07_24_2024.pdf`,
      );

      expect(response.status).toBe(200);
    });
  });
});
