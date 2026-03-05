import { NextFunction } from "express";
import request from "supertest";

import app from "../../app";
import { User, UserRequest } from "../../types/request";
import {
  createTestContainer,
  removeTestContainer,
} from "../helper/testContainer";

jest.mock("../../middlewares/bo-check-JWT", () =>
  jest.fn((req: UserRequest, _res: Response, next: NextFunction) => {
    req.decoded = { id: 1, role: "admin" } as unknown as User;
    next();
  }),
);

beforeAll(async () => {
  await createTestContainer();
});

afterAll(async () => {
  await removeTestContainer();
});

describe("Documents static/public controllers", () => {
  describe("GET /documents/admin/static/:name", () => {
    it("devrait retourner le fichier statique d'administration et appeler DocumentService.getStaticFile avec le répertoire static", async () => {
      const response = await request(app).get(
        `/documents/admin/static/agrements_VAO_non_actifs_07_24_2024.pdf`,
      );

      expect(response.status).toBe(200);
    });
  });
});
