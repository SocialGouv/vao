---
name: dev-back
description: >-
  Implement or modify VAO backend Express TypeScript modules (usagers /
  admin / shared) and shared-bridge API contracts. Use when adding or
  changing API routes, controllers, services, repositories, yup schemas,
  or when the user asks for backend / API work.
---

# Développement backend VAO

Lire [`AGENTS.md`](../../../AGENTS.md). Pour les TI : skill `write-integration-tests`. Pour les TU de fonctions pures : skill `write-unit-tests`.

## Cible

Nouveau code **TypeScript** dans `packages/backend/src/`, contrats dans `packages/shared-bridge`.

Ne pas étendre le legacy `controllers/`, `services/`, `routes/`, `schemas/` (souvent `.js`). Si on touche un flux legacy, extraire la tranche vers l’architecture ci-dessous.

Référence vivante : `packages/backend/src/{usagers,admin,shared}/agrements/`.

## Architecture

```
packages/shared-bridge/src/
  dto/<domaine>.dto.ts
  constantes/
  routes/{usagers,admin}/<domaine>/
    index.ts          # *Routes + *RoutesSchema
    getList.ts        # interface BasicRoute + yup
packages/backend/src/
  usagers/<domaine>/          # FO
    <domaine>.route.ts        # checkJWT + validator + permissions
    <domaine>.controller.ts
    <domaine>.service.ts
    <domaine>.repository.ts   # SQL spécifique FO
    <domaine>.mail.ts
  admin/<domaine>/            # BO — même découpage, boCheckJWT
  shared/<domaine>/           # commun FO+BO
    <domaine>.service.ts
    <domaine>.repository.ts
    <domaine>.mapper.ts
    <domaine>.entity.ts
```

| Couche          | Fait                                                              | Ne fait pas        |
| --------------- | ----------------------------------------------------------------- | ------------------ |
| `shared-bridge` | DTO camelCase, `BasicRoute`, schéma yup, constantes               | SQL, Express       |
| `route`         | JWT, permissions, `requestValidatorMiddleware(schema)`            | métier             |
| `controller`    | `RouteRequest` / `RouteResponse`, lit `validated*`, `next(error)` | SQL, règles métier |
| `service`       | métier, `withTransaction`, `AppError` / `FunctionalException`     | HTTP               |
| `repository`    | SQL paramétré (`$1`, `$2`) via `getPool()` ou `tx`                | règles métier      |
| `mapper`        | entity snake_case → DTO camelCase                                 |                    |
| `entity`        | typage des lignes SQL                                             |                    |

FO vs BO : services spécifiques dans `usagers/` et `admin/` ; commun dans `shared/`. Monter le routeur dans `packages/backend/src/app.ts` (`/agrements`, `/admin/agrements`, …).

## Workflow d'une feature

1. **Contrat** dans `shared-bridge` : DTO + `interface XxxRoute extends BasicRoute` (`method`, `path`, `params` / `query` / `body`, `response`) + `RouteSchema` yup. Exporter depuis `routes/<cible>/<domaine>/index.ts` et `routes/index.ts`.
2. **Entity + mapper + repository** (`shared/` si les deux apps lisent les mêmes tables).
3. **Service** domaine (FO et/ou BO), qui délègue au shared.
4. **Controller** typé + **route** avec middlewares.
5. **TI** obligatoire pour chaque endpoint nouveau ou modifié → skill `write-integration-tests`.
6. **TU** uniquement pour le mapping / helpers purs (`.spec.ts` à côté).

## Règles

- `.ts` : `import` / `export` uniquement.
- Contrôleur : `try/catch` → `next(error)` ; succès via `res.status(…).json(…)` aligné sur `response` du contrat.
- Validation entrée : yup du contrat, pas un second schéma local. Le contrôleur consomme `req.validatedBody` / `validatedQuery` / `validatedParams`.
- Auth : `checkJWT` (FO), `boCheckJWT` (BO). Permissions : middlewares dédiés (`checkPermission*`), pas de check ad hoc dans le service si un middleware existe.
- Écritures liées : une seule `withTransaction` (`packages/backend/src/utils/pgpool.ts`). Le client `tx` est passé au repository.
- Pools : métier `getPool()`, documents `getPoolDoc()`.
- Erreurs opérationnelles : `AppError` (`statusCode`, `name`). Erreurs métier attendues par le front : `FunctionalException` (HTTP 422).
- Logger : `const log = logger(module.filename)`.
- SQL : requêtes paramétrées ; schémas `front.` / `back.` selon la table. Pas de SQL brut dans les TI (helpers).
- Migrations schéma : Knex dans `packages/migrations` (fichiers `.js` en `require` / `module.exports`). Un seed `pg/seeds` ne suffit pas pour la prod.
- Pas de `console.log`, favoriser les `log.d`. Pas de double ternaire.

## Contrôleur (pattern)

```ts
export const FooController = {
  async getList(req: RouteRequest<FooUsagersRoutes["GetList"]>, res: RouteResponse<FooUsagersRoutes["GetList"]>, next: NextFunction) {
    try {
      const items = await FooService.getList({
        userId: Number(req.decoded!.id),
        statut: req.validatedQuery?.statut ?? null,
      });
      res.status(200).json({ items });
    } catch (error) {
      next(error);
    }
  },
};
```

## Checklist

- [ ] Contrat `shared-bridge` (type + yup) avant le code serveur
- [ ] Fichiers sous `usagers/` ou `admin/` (+ `shared/` si commun)
- [ ] Route : JWT + validator + permission
- [ ] Transaction si plusieurs écritures
- [ ] Validation backend alignée avec le front
- [ ] TI dans `packages/backend/src/__tests__/{usagers,admin}/`
- [ ] Pas de nouveau `.js` / `require` dans le backend applicatif
