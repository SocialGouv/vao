import type { NextFunction, Response } from "express";
import request from "supertest";

import app from "../../app";
import boCheckJWT from "../../middlewares/bo-check-JWT";
import { User, UserRequest } from "../../types/request";
import { createTerritoire } from "../helpers/territoireHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helpers/testContainer";

jest.mock("../../middlewares/bo-check-JWT", () => jest.fn());

beforeAll(async () => {
  await createTestContainer();
});

afterAll(async () => {
  await removeTestContainer();
});

beforeEach(() => {
  (boCheckJWT as jest.Mock).mockImplementation(
    (req: UserRequest, _res: Response, next: NextFunction) => {
      req.decoded = {
        id: 1,
        roles: ["Compte"],
        territoireCode: "FRA",
      } as unknown as User;
      next();
    },
  );
});

describe("GET /territoire/list", () => {
  it("retourne une réponse pour la liste des territoires", async () => {
    const response = await request(app).get("/territoire/list");
    expect(response.status).not.toBe(404);
  });
});

describe("GET /territoire/get-one/:id", () => {
  it("retourne une réponse pour un territoire existant", async () => {
    const territoireId = await createTerritoire({ territoireCode: "FRA" });
    const response = await request(app).get(
      `/territoire/get-one/${territoireId}`,
    );
    expect(response.status).not.toBe(404);
  });
});

describe("GET /territoire/get-fiche-id-by-ter-code/:code", () => {
  it("retourne une réponse pour un code territoire", async () => {
    const response = await request(app).get(
      "/territoire/get-fiche-id-by-ter-code/FRA",
    );
    expect(response.status).not.toBe(404);
  });
});

describe("PUT /territoire/:id", () => {
  it("retourne une réponse pour la mise à jour d'un territoire", async () => {
    const territoireId = await createTerritoire({ territoireCode: "FRA" });
    const response = await request(app)
      .put(`/territoire/${territoireId}`)
      .send({});
    expect(response.status).not.toBe(404);
  });
});
