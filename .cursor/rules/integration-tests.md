---
description:
globs:
alwaysApply: true
---

# TI

Les tests d'intégrations :

- sont présent dans le dossier backend/\__tests_
- ne doivent pas mocker les services
- ne doivent pas mocker les requetes en base de données
- doivent mocker les appels externe (axios, services/mail, etc)
- sont séparés en deux macro-domaines admin (aussi appelé bo) et usagers (aussi appelé fo)
- le code http retourné doit être testé de façon stricte pour un use case précis (ex: `.toBe(404)` et non `.toBeLessThan(500)` ni `[401, 409, 500]).toContain(response.status)`)

# Exemple

```
import { NextFunction } from "express";
import request from "supertest";

import app from "../../app";
import checkJWT from "../../middlewares/checkJWT";
import { User, UserRequest } from "../../types/request";
import { createUsagersUser } from "../helper/fixtures/userHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helper/testContainer";

jest.mock("../../middlewares/checkJWT", () =>
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

describe("GET /users/me", () => {
  it("devrait retourner le user courant avec ses feature flags", async () => {
    const frontUser = await createUsagersUser();

    (checkJWT as jest.Mock).mockImplementation((req, _res, next) => {
      req.decoded = { email: frontUser.email };
      next();
    });

    const response = await request(app).get("/users/me");

    expect(response.status).toBe(200);
    expect(response.body.user).toBeDefined();
    expect(response.body.user.email).toBe(frontUser.email);
    expect(response.body.user.featureFlags).toBeDefined();
    expect(typeof response.body.user.featureFlags).toBe("object");
  });

  it("should return a 404 error if the user is not found", async () => {
    (checkJWT as jest.Mock).mockImplementation((req, _res, next) => {
      req.decoded = { email: "invalid@example.com" };
      next();
    });
    const response = await request(app).get("/users/me");
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("name", "UserNotFound");
  });
});
```
