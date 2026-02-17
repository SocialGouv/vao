# Tests

Ce document présente l'architecture et l'organisation des tests dans le projet VAO.

## Vue d'ensemble

Le projet VAO utilise une approche de tests en pyramide avec trois niveaux :

1. **[Tests unitaires](./UNIT_TESTS.md)** - Tests rapides et isolés des composants individuels (`.spec.ts`)
2. **[Tests d'intégration](./TEST_INTEGRATIONS.md)** - Tests des interactions entre composants avec base de données réelle (`.test.ts`)
3. **[Tests E2E](./E2E_TESTS.md)** - Tests complets du parcours utilisateur via l'interface web

## Architecture des tests

```
docs/tests/
├── README.md                 # Ce fichier - Vue d'ensemble
├── UNIT_TESTS.md            # Tests unitaires (Jest, Vitest)
├── TEST_INTEGRATIONS.md     # Tests d'intégration (Testcontainers)
└── E2E_TESTS.md             # Tests End2End (Playwright)
```

## Commandes rapides

### Tests unitaires

```bash
# Tous les tests unitaires
pnpm -w test:unit:all

# Backend uniquement
pnpm -w test:unit:backend

# API uniquement
pnpm -w test:unit:api
```

### Tests d'intégration

```bash
# Tests d'intégration (depuis le package backend)
cd packages/backend
pnpm test --testPathPattern=__tests__
```

### Tests E2E

```bash
# Tests E2E en local
pnpm -w tests:e2e

# Interface graphique
pnpm -w tests:e2e:ui
```

## Documentation détaillée

- **[Tests unitaires](./UNIT_TESTS.md)** - Configuration Jest/Vitest, bonnes pratiques, exemples
- **[Tests d'intégration](./TEST_INTEGRATIONS.md)** - Testcontainers, fixtures, architecture complète
- **[Tests E2E](./E2E_TESTS.md)** - Playwright, scénarios, configuration CI/CD

## Liens utiles

- [Configuration Playwright](https://playwright.dev/docs/test-configuration)
- [Testcontainers](https://testcontainers.com/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Vitest Documentation](https://vitest.dev/guide/)
