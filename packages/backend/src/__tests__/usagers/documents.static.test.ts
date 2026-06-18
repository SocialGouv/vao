import request from "supertest";

import app from "../../app";

describe("Documents static/public controllers", () => {
  describe("GET /documents/public/:name", () => {
    it("devrait retourner le fichier public et appeler DocumentService.getStaticFile avec le répertoire public", async () => {
      const response = await request(app).get(
        `/documents/public/modele_EIG.pdf`,
      );

      expect(response.status).toBe(200);
    });
  });
});
