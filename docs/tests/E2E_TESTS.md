# Tests E2E (End-to-End)

## Vue d'ensemble

Les tests E2E simulent le comportement réel des utilisateurs via l'interface web, testant l'application complète de bout en bout.

## Configuration

- **Framework** : Playwright
- **Localisation** : `/e2e/`
- **Configuration** : `playwright.config.ts`
- **Navigateurs** : Chromium

## Structure

```
e2e/
├── data/                     # Fichiers de test (PDF, images, etc.)
│   └── agrement.pdf
└── register-login-organisateur.spec.ts
```

## Commandes

```bash
# Tests E2E en local
yarn tests:e2e

# Interface graphique
yarn tests:e2e:ui

# Mode debug
yarn tests:e2e --debug

# Fichier spécifique
yarn tests:e2e --grep "register_and_login"
```

## Scénarios testés

### Inscription et connexion

- **Parcours** : Création de compte → Validation email → Connexion
- **Données** : Email généré automatiquement, SIRET de test
- **Intégration** : MailDev pour la validation email

### Création d'organisateur (commenté)

- **Parcours complet** : 5 étapes de finalisation de fiche
- **Note** : Actuellement commenté pour problèmes de stabilité

## Variables d'environnement

- `E2E_BASE_URL` : URL de base (défaut : `vao-main.ovh.fabrique.social.gouv.fr`)
- `E2E_LOCAL` : Mode local (`true` pour `localhost:3000`)
- `E2E_USERNAME` : Email de test (généré automatiquement)

## Bonnes pratiques

1. **Sérialisation** : Tests dépendants exécutés en série
2. **Données uniques** : Utilisation d'UUID pour éviter les conflits
3. **Attentes explicites** : `expect()` pour chaque étape critique
4. **Sélecteurs robustes** : Préférer les sélecteurs par rôle, label ou texte

## Exemple de test

```typescript
test("register_and_login", async ({ page }) => {
  // Navigation vers la page de connexion
  await page.goto(`${getUrl()}/connexion`);
  await expect(page.getByText("Connexion à VAO")).toBeVisible();

  // Clic sur "Créer un compte"
  await page.getByRole("button", { name: "Créer un compte" }).click();

  // Remplissage du formulaire
  await page.getByPlaceholder("Veuillez saisir votre email").fill(username);
  await page.getByLabel("Mot de passe Veuillez saisir").fill(password);

  // Soumission et vérification
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await expect(page.getByText("Votre formulaire a été envoyé")).toBeVisible();
});
```

## Maintenance

### Ajout de nouveaux scénarios

1. Créer un nouveau fichier `.spec.ts` dans `/e2e/`
2. Définir les données de test nécessaires
3. Implémenter le parcours utilisateur
4. Ajouter les assertions appropriées

### Debugging

```bash
# Mode debug avec pause
yarn tests:e2e --debug

# Tests avec trace
yarn tests:e2e --trace on

# Inspection des sélecteurs
npx playwright codegen
```

## Documentation externe

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Best Practices](https://playwright.dev/docs/best-practices)
