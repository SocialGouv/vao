import express, { Request, Response } from "express";
import request from "supertest";

import router from "../../usagers/agrements/agrements.route";

jest.mock("../../middlewares/checkJWT", () =>
  jest.fn((req, res, next) => next()),
);
jest.mock("../../middlewares/checkPermissionAgrement", () =>
  jest.fn((req, res, next) => next()),
);

const mockGet = jest.fn((req: Request, res: Response) =>
  res.status(200).json({ ok: true }),
);

const mockPost = jest.fn((req: Request, res: Response) =>
  res.status(201).json({ created: true }),
);

jest.mock("./agrements.controller", () => ({
  AgrementController: {
    get: (req: Request, res: Response) => mockGet(req, res),
    post: (req: Request, res: Response) => mockPost(req, res),
  },
}));

const app = express();
app.use(express.json());
app.use("/agrements", router);

describe("Agrements routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET /agrements/organisme/:id appelle le controller get", async () => {
    const res = await request(app).get("/agrements/organisme/123");

    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("POST /agrements appelle le controller post", async () => {
    const res = await request(app).post("/agrements").send({ test: true });

    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ created: true });
  });
});
