import { NextFunction, Response } from "express";
import request from "supertest";

import app from "../../app";
import boCheckJWT from "../../middlewares/bo-check-JWT";
import { User, UserRequest } from "../../types/request";
import {
  createTestContainer,
  removeTestContainer,
} from "../helpers/testContainer";

jest.mock("../../middlewares/bo-check-JWT", () => jest.fn());
jest.mock("../../middlewares/checkPermissionBOForUpdateStatusFo", () =>
  jest.fn((_req: UserRequest, _res: Response, next: NextFunction) => next()),
);
jest.mock("../../middlewares/checkPermissionBoForFoStatus", () =>
  jest.fn((_req: UserRequest, _res: Response, next: NextFunction) => next()),
);

beforeAll(async () => {
  await createTestContainer();
});

afterAll(async () => {
  await removeTestContainer();
});

beforeEach(() => {
  (boCheckJWT as jest.Mock).mockImplementation(
    (req: UserRequest, _res: Response, next: NextFunction) => {
      req.decoded = { id: 1, territoireCode: "FRA" } as unknown as User;
      next();
    },
  );
});

describe("Domaine /fo-user (admin)", () => {
  it("couvre les endpoints admin /fo-user", async () => {
    const responses = await Promise.all([
      request(app).get("/fo-user/admin/list"),
      request(app).get("/fo-user/admin/list-to-validate"),
      request(app).post("/fo-user/admin/update-status/1").send({}),
      request(app).get("/fo-user/admin/extract/"),
    ]);

    responses.forEach((response) => {
      expect(response.status).not.toBe(404);
    });
  });
});
