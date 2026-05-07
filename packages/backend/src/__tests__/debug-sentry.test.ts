import request from "supertest";

import app from "../app";
import config from "../config";

describe("GET /debug-sentry", () => {
  it("retourne une erreur gérée quand la route est activée", async () => {
    if (config.sentry.environment === "production") {
      return;
    }

    const response = await request(app).get("/debug-sentry");

    expect(response.status).toBeGreaterThanOrEqual(400);
  });
});
