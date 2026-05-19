---
description:
globs:
alwaysApply: true
---

# TI

Les tests d'intégrations :

- sont présents dans le dossier `backend/\__tests__`
- doivent tester des endpoint de l'api (via supertest)
- ne doivent pas mocker les services
- ne doivent pas mocker les requetes en base de données
- doivent mocker les appels externe (axios, smtp, redis, etc)
- il ne faut pas mocker les middleware, seuls `checkJWT` (FO) et `bo-check-JWT` (BO) peuvent être mockés via `getFoAppHelper` / `getBoAppHelper`
- les données nécessaires aux tests doivent être créées à l'aide des helpers (pas de requête sql dans les fichiers de tests)
- sont séparés en deux macro-domaines admin (aussi appelé bo) et usagers (aussi appelé fo)
- les tests sont découpés avec un describe() par endpoint et un ensemble de it() pour les différent cas (code 200, 400, ...)
- le code http retourné doit être testé de façon stricte pour un use case précis (ex: `.toBe(404)` et non `.toBeLessThan(500)` ni `[401, 409, 500]).toContain(response.status)`)

# Exemple

```
import request from "supertest";

import { getFoAppHelper } from "../helpers/appHelper";
import { createUsagersUser } from "../helpers/userHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helpers/testContainer";

beforeAll(async () => {
  await createTestContainer();
});

afterAll(async () => {
  await removeTestContainer();
});

describe("GET /users/me", () => {
  it("devrait retourner le user courant avec ses feature flags", async () => {
    const frontUser = await createUsagersUser();

    const response = await request(
      getFoAppHelper({ id: frontUser.id, email: frontUser.email }),
    ).get("/users/me");

    expect(response.status).toBe(200);
    expect(response.body.user).toBeDefined();
    expect(response.body.user.email).toBe(frontUser.email);
    expect(response.body.user.featureFlags).toBeDefined();
    expect(typeof response.body.user.featureFlags).toBe("object");
  });

  it("should return a 404 error if the user is not found", async () => {
    const response = await request(
      getFoAppHelper({ email: "invalid@example.com", id: 0 }, { once: true }),
    ).get("/users/me");
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("name", "UserNotFound");
  });
});
```
