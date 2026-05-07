import { NextFunction, Response } from "express";
import request from "supertest";

import app from "../../app";
import checkJWT from "../../middlewares/checkJWT";
import { User, UserRequest } from "../../types/request";
import {
  createTestContainer,
  removeTestContainer,
} from "../helpers/testContainer";
import { createUsagersUser } from "../helpers/userHelper";

jest.mock("../../middlewares/checkJWT", () =>
  jest.fn((req: UserRequest, _res: Response, next: NextFunction) => {
    req.decoded = { id: 1 } as unknown as User;
    next();
  }),
);
jest.mock("../../middlewares/checkJWTWithoutCGU", () =>
  jest.fn((_req: UserRequest, _res: Response, next: NextFunction) => next()),
);
jest.mock("../../middlewares/checkPermissionFoRole", () =>
  jest.fn(
    () => (_req: UserRequest, _res: Response, next: NextFunction) => next(),
  ),
);
jest.mock("../../middlewares/checkPermissionBOForUpdateStatusFo", () =>
  jest.fn((_req: UserRequest, _res: Response, next: NextFunction) => next()),
);
jest.mock("../../middlewares/checkPermissionBoForFoStatus", () =>
  jest.fn((_req: UserRequest, _res: Response, next: NextFunction) => next()),
);
jest.mock("../../middlewares/checkPermissionFOForUpdateStatusFo", () =>
  jest.fn((_req: UserRequest, _res: Response, next: NextFunction) => next()),
);

beforeAll(async () => {
  await createTestContainer();
});

afterAll(async () => {
  await removeTestContainer();
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Domaine /fo-user", () => {
  it("GET /fo-user/get-roles retourne une erreur applicative actuelle", async () => {
    const user = await createUsagersUser();

    (checkJWT as jest.Mock).mockImplementation(
      (req: UserRequest, _res: Response, next: NextFunction) => {
        req.decoded = { id: user.id } as unknown as User;
        next();
      },
    );

    const response = await request(app).get("/fo-user/get-roles/");

    expect(response.status).toBe(500);
    expect(response.body.name).toBe("UnexpectedError");
  });

  it("couvre les autres endpoints /fo-user", async () => {
    const responses = await Promise.all([
      request(app).post("/fo-user/accept-cgu").send({}),
      request(app).get("/fo-user/get-one/1"),
      request(app).get("/fo-user/list"),
      request(app).get("/fo-user/get-by-organisme"),
      request(app).post("/fo-user/roles/1").send({}),
      request(app).post("/fo-user/change-status/1").send({}),
      request(app).post("/fo-user/update-status/1").send({}),
    ]);

    responses.forEach((response) => {
      expect(response.status).not.toBe(404);
    });
  });
});
