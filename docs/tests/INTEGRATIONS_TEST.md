# Tests d'intégration

## Principe

Les tests d'intégration se trouvent dans `packages/backend/src/__tests__/` et testent le comportement réel de l'application en conditions proches de la production.

### Caractéristiques

- **Appels directs aux endpoints** : Utilisation de `supertest` pour tester les routes HTTP
- **Pas de mocks des services** : Les services sont appelés réellement pour tester l'intégration complète
- **Base de données réelle** : Utilisation de Testcontainers avec PostgreSQL pour une base de données isolée
- **Jeu de données programmatique** : Injection de données de test via des helpers dédiés
- **Container dédié** : Chaque fichier de test instancie son propre container PostgreSQL

## Architecture des tests

### Structure des dossiers

```
packages/backend/src/__tests__/
├── admin/                    # Tests des endpoints admin (bo)
├── usagers/                  # Tests des endpoints usagers (fo)
└── helper/                   # Helpers pour les tests
    ├── testContainer.ts      # Gestion des containers de test
    └── fixtures/             # Helpers de création de données
        ├── userHelper.ts     # Création d'utilisateurs de test
        ├── organismeHelper.ts # Création d'organismes de test
        └── hebergementHelper.ts # Création d'hébergements de test
```

### Gestion des données

Le container est initialisé avec un dump de la base de données de test contenant :

- Structure des tables
- Données de référence (rôles, territoires, etc.)
- Configuration de base

### Cycle de vie des tests

Chaque fichier de test suit ce pattern :

```typescript
beforeAll(async () => {
  await createTestContainer();
});

afterAll(async () => {
  await removeTestContainer();
});
```

## Helpers de données (fixtures)

Les helpers situés dans `helper/fixtures/` permettent de créer facilement des données de test en base sans avoir à gérer manuellement les jointures et les contraintes de clés étrangères.

### Principe de base

Chaque helper :

- **Crée des données complètes** avec toutes les relations nécessaires
- **Gère automatiquement les jointures** (utilisateur → organisme → hébergement)
- **Permet la surcharge** des valeurs par défaut via des paramètres optionnels
- **Assure l'unicité** des données (timestamps, emails uniques, etc.)

### Exemple d'utilisation

```typescript
// Création simple avec valeurs par défaut
const userId = await createUsagersUser();
const organismeId = await createOrganisme({ userId });
const hebergementId = await createHebergement({ userId, organismeId });

// Création avec surcharge de valeurs spécifiques
const customUser = await createUsagersUser({
  email: "custom@example.com",
  nom: "NomPersonnalisé",
});
```

## Exemple complet

Voir `packages/backend/src/__tests__/admin/herbergement.test.ts` pour un exemple complet d'utilisation.

## Configuration des containers

### TestContainer PostgreSQL

- **Image** : `postgres:15.1`
- **Timeout de démarrage** : 15 secondes
- **Initialisation** : Exécution des scripts d'initialisation SQL et lancement des migrations

## Bonnes pratiques

1. **Isolation** : Chaque test doit être indépendant et ne pas dépendre des données d'autres tests
2. **Nettoyage** : Utiliser les helpers pour créer des données uniques (timestamps, IDs aléatoires)
3. **Authentification** : Mocker le middleware JWT pour simuler l'authentification
4. **Assertions** : Vérifier à la fois le statut HTTP et la structure des données retournées
5. **Nommage** : Utiliser des descriptions claires en français pour les tests

## Commandes utiles

```bash
# Lancer tous les tests d'intégration (depuis le package backend)
cd packages/backend
pnpm test --testPathPattern=__tests__

# Mode debug avec inspecteur Node.js et détection des handles ouverts
pnpm test:debug --testPathPattern=__tests__
```
