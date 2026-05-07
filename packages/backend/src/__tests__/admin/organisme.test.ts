import { NextFunction, Response } from "express";
import request from "supertest";

import app from "../../app";
import boCheckJWT from "../../middlewares/bo-check-JWT";
import { User, UserRequest } from "../../types/request";
import AppError from "../../utils/error";
import { createOrganisme } from "../helpers/organismeHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helpers/testContainer";
import { createUsagersUser } from "../helpers/userHelper";

jest.mock("../../middlewares/bo-check-JWT", () => jest.fn());

const boCheckJWTMock = boCheckJWT as unknown as jest.Mock;

let boFixtureOrganismeId = 0;

beforeAll(async () => {
  await createTestContainer();
  const user = await createUsagersUser();
  boFixtureOrganismeId = await createOrganisme({ userId: user.id });
});

afterAll(async () => {
  await removeTestContainer();
});

beforeEach(() => {
  jest.clearAllMocks();
  boCheckJWTMock.mockImplementation(
    (req: UserRequest, _res: Response, next: NextFunction) => {
      req.decoded = { id: 1, territoireCode: "FRA" } as unknown as User;
      next();
    },
  );
});

describe("GET /organisme/bo/liste", () => {
  it("retourne 200 avec pagination", async () => {
    const response = await request(app).get("/organisme/bo/liste");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("rows");
    expect(response.body).toHaveProperty("total");
    expect(Array.isArray(response.body.rows)).toBe(true);
    expect(typeof response.body.total).toBe("number");
  });
});

describe("GET /organisme/bo/nonagrees", () => {
  it("retourne 200 avec une liste d'organismes", async () => {
    const response = await request(app).get("/organisme/bo/nonagrees");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("organismes");
    expect(Array.isArray(response.body.organismes)).toBe(true);
  });
});

describe("GET /organisme/bo/:organismeId", () => {
  it("retourne 200 et l'organisme pour un id existant", async () => {
    const response = await request(app).get(
      `/organisme/bo/${boFixtureOrganismeId}`,
    );

    expect(response.status).toBe(200);
    expect(response.body.organisme.organismeId).toBe(boFixtureOrganismeId);
  });
});

describe("GET /organisme/bo/extract", () => {
  it("retourne 200 et un CSV", async () => {
    const response = await request(app).get("/organisme/bo/extract");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("text/csv");
    expect(response.text).toContain('"Type";"Date de modification"');
  });

  it("retourne 401 si le middleware bo-check-JWT échoue", async () => {
    boCheckJWTMock.mockImplementation(
      (_req: UserRequest, _res: Response, next: NextFunction) => {
        next(
          new AppError("Utilisateur sans territoire", {
            name: "UnsignedUser",
            statusCode: 401,
          }),
        );
      },
    );

    const response = await request(app).get("/organisme/bo/extract");

    expect(response.status).toBe(401);
    expect(response.body.name).toBe("UnsignedUser");
  });
});
