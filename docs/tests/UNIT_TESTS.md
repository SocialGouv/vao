# Tests unitaires

## Vue d'ensemble

Les tests unitaires sont des tests rapides et isolés qui vérifient le comportement de composants individuels sans dépendances externes.

## Backend

### Configuration

- **Framework** : Jest
- **Configuration** : `packages/backend/jest.config.js`
- **Dépendances** : `@types/jest`, `ts-jest`, `supertest`

### Structure et placement

Les tests unitaires sont placés **au plus près des fichiers testés** avec le suffixe `.spec.ts` :

```
packages/backend/src/
├── services/
│   ├── userService.ts
│   └── userService.spec.ts           # Test unitaire du service
├── middlewares/
│   ├── auth.ts
│   └── auth.spec.ts                  # Test unitaire du middleware
└── utils/
    ├── validation.ts
    └── validation.spec.ts            # Test unitaire de l'utilitaire
```

**Convention de nommage :**

- **Tests unitaires** : `.spec.ts` (ex: `userService.spec.ts`)
- **Tests d'intégration** : `.test.ts` (ex: `herbergement.test.ts`)

> **Note** : Les tests d'intégration restent dans `packages/backend/src/__tests__/` car ils nécessitent une configuration spéciale (Testcontainers, fixtures, etc.)

### Commandes

```bash
# Lancer un fichier de test spécifique (depuis le package)
cd packages/backend
yarn test -- src/services/userService.spec.ts

# Tests en mode watch (depuis le package)
cd packages/backend
yarn test:watch

# Tests en mode debug (depuis le package)
cd packages/backend
yarn test:debug
```

### Exemple de test unitaire

```typescript
// userService.spec.ts
import { UserService } from "./userService";
import { UserRepository } from "../repositories/userRepository";

// Mock des dépendances
jest.mock("../repositories/userRepository");

const mockUserRepository = UserRepository as jest.Mocked<typeof UserRepository>;

describe("UserService", () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    jest.clearAllMocks();
  });

  it("devrait créer un utilisateur avec succès", async () => {
    // Arrange
    const userData = { email: "test@example.com", nom: "Test" };
    mockUserRepository.create.mockResolvedValue({ id: 1, ...userData });

    // Act
    const result = await userService.createUser(userData);

    // Assert
    expect(result).toEqual({ id: 1, ...userData });
    expect(mockUserRepository.create).toHaveBeenCalledWith(userData);
  });
});
```

## Bonnes pratiques

### Générales

1. **Isolation** : Chaque test doit être indépendant
2. **Nommage** : Descriptions claires en français
3. **Assertions** : Vérifier le comportement attendu
4. **Couverture** : Maintenir une couverture de code élevée

### Backend

1. **Mocks** : Utiliser des mocks pour les dépendances externes
2. **Services** : Tester la logique métier isolément
3. **Middlewares** : Tester la logique d'authentification et validation
4. **Utils** : Tester les fonctions utilitaires pures
