---
name: write-integration-tests
description: >-
  Write or update VAO backend integration tests with supertest and
  Testcontainers in packages/backend/src/__tests__. Use when adding API tests,
  writing *.test.ts under __tests__, or when the user asks for TI /
  tests d'intégration.
---

# Tests d'intégration VAO

## Règles

Les tests d'intégration :

- sont présents dans `packages/backend/src/__tests__/`
- doivent tester des **endpoints** de l'API (via `supertest`)
- ne doivent **pas** mocker les services
- ne doivent **pas** mocker les requêtes en base de données
- doivent mocker les **appels externes** (axios, smtp, redis, etc.)
- ne doivent pas mocker les middlewares, seuls `checkJWT` (FO) et `bo-check-JWT` (BO) peuvent être mockés via `getFoAppHelper` / `getBoAppHelper`
- les données nécessaires aux tests doivent être créées à l'aide des **helpers** (pas de requête SQL dans les fichiers de tests)
- sont séparés en deux macro-domaines : **admin** (aussi appelé bo) et **usagers** (aussi appelé fo)
- sont découpés avec un `describe()` par endpoint et un ensemble de `it()` pour les différents cas (code 200, 400, …)
- le code HTTP retourné doit être testé de façon **stricte** pour un use case précis (ex. `.toBe(404)` et non `.toBeLessThan(500)` ni `[401, 409, 500].toContain(response.status)`)
- fichiers nommés en minuscules, suffixe `.test.ts`
- TypeScript avec `import` / `export`
- Documentation humaine de référence : `docs/tests/INTEGRATIONS_TEST.md`

## Structure

```
packages/backend/src/__tests__/
├── admin/                 # endpoints BO
├── usagers/               # endpoints FO
├── helpers/               # appHelper, testContainer, userHelper, …
├── fixtures/              # jeux de données réutilisables
├── healthz.test.ts
└── …
```

## Cycle de vie container

Chaque fichier de test instancie son container :

```ts
beforeAll(async () => {
  await createTestContainer();
});

afterAll(async () => {
  await removeTestContainer();
});
```

## Helpers

- Auth FO : `getFoAppHelper(user)` — mock de `checkJWT`
- Auth BO : `getBoAppHelper(user)` — mock de `bo-check-JWT`
- Users : `createUsagersUser()`, helpers BO selon le besoin
- Domaine : `createOrganisme`, `createHebergement`, etc. dans `helpers/`
- Option `once: true` sur le helper JWT si le mock ne doit s'appliquer qu'une fois

Pas de SQL brut dans le fichier de test : tout passe par les helpers.

## Commandes utiles

```bash
cd packages/backend
pnpm test --testPathPattern=__tests__
pnpm test:debug --testPathPattern=__tests__/usagers/users.test.ts
```

## Exemple (référence historique Cursor — GET /users/me)

```ts
import request from "supertest";

import { getFoAppHelper } from "../helpers/appHelper";
import { createUsagersUser } from "../helpers/userHelper";
import { createTestContainer, removeTestContainer } from "../helpers/testContainer";

beforeAll(async () => {
  await createTestContainer();
});

afterAll(async () => {
  await removeTestContainer();
});

describe("GET /users/me", () => {
  it("devrait retourner le user courant avec ses feature flags", async () => {
    const frontUser = await createUsagersUser();

    const response = await request(getFoAppHelper({ id: frontUser.id, email: frontUser.email })).get("/users/me");

    expect(response.status).toBe(200);
    expect(response.body.user).toBeDefined();
    expect(response.body.user.email).toBe(frontUser.email);
    expect(response.body.user.featureFlags).toBeDefined();
    expect(typeof response.body.user.featureFlags).toBe("object");
  });

  it("should return a 404 error if the user is not found", async () => {
    const response = await request(getFoAppHelper({ email: "invalid@example.com", id: 0 }, { once: true })).get("/users/me");
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("name", "UserNotFound");
  });
});
```

Exemple vivant dans le repo : `packages/backend/src/__tests__/usagers/users.test.ts`  
(variante courante : `getFoAppHelper(frontUser)` quand l'objet user complet suffit).

## Checklist avant de terminer

- [ ] Fichier sous `admin/` ou `usagers/` selon le domaine
- [ ] `createTestContainer` / `removeTestContainer`
- [ ] Auth via `getFoAppHelper` ou `getBoAppHelper` uniquement
- [ ] Données via helpers (pas de SQL)
- [ ] Services et DB non mockés ; externes mockés si nécessaire
- [ ] `describe` par route ; status HTTP strict par cas
- [ ] Nouveau comportement backend couvert (ne pas se contenter d'un TU `shared-bridge`)
