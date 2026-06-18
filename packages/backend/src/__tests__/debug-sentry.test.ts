import request from "supertest";

import app from "../app";

describe("GET /debug-sentry", () => {
  it("retourne une erreur gérée quand la route est activée", async () => {
    const response = await request(app).get("/debug-sentry");

    expect(response.status).toBe(500);
  });
});
