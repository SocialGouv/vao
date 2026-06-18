import request from "supertest";

import app from "../app";

describe("GET /healthz", () => {
  it("retourne 200", async () => {
    const response = await request(app).get("/healthz");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});
