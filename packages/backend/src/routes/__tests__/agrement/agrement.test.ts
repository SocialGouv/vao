import express from "express";
import request from "supertest";

import agrementController from "../../../controllers/agrement";
import checkJWT from "../../../middlewares/checkJWT";
import checkPermissionAgrement from "../../../middlewares/checkPermissionAgrement";
import router from "../../agrement";

// 🧱 On mocke les middlewares et le contrôleur
jest.mock("../../../middlewares/checkJWT", () =>
  jest.fn((req, res, next) => next()),
);
jest.mock("../../../middlewares/checkPermissionAgrement", () =>
  jest.fn((req, res, next) => next()),
);
jest.mock("../../../controllers/agrement", () => ({
  getByOrganismeId: jest.fn((req, res) => res.status(200).json({ ok: true })),
  post: jest.fn((req, res) => res.status(201).json({ created: true })),
}));

const app = express();
app.use(express.json());
app.use("/agrement", router);

describe("🧪 Routes /agrement", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET /agrement/organisme/:id appelle les middlewares et le contrôleur", async () => {
    const res = await request(app).get("/agrement/organisme/123");

    expect(checkJWT).toHaveBeenCalled();
    expect(checkPermissionAgrement).toHaveBeenCalled();
    expect(agrementController.getByOrganismeId).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("POST /agrement appelle les middlewares et le contrôleur post", async () => {
    const res = await request(app).post("/agrement").send({ organismeId: 42 });

    expect(checkJWT).toHaveBeenCalled();
    expect(checkPermissionAgrement).toHaveBeenCalled();
    expect(agrementController.post).toHaveBeenCalled();
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ created: true });
  });
});
