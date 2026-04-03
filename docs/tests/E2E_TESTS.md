# Tests E2E (End-to-End)

## Vue d'ensemble

Les tests E2E simulent le comportement réel des utilisateurs via l'interface web, testant l'application complète de bout en bout.

## Prérequis (local)

Avant de lancer les tests contre une base locale, la stack (PostgreSQL accessible, services démarrés) doit être en place. Ensuite, il faut **appliquer les migrations Knex** puis **exécuter les seeds E2E** du package `packages/migrations` : elles préparent un état connu (procédure de nettoyage, données de référence attendues par les scénarios, nettoyage des comptes de test `e2e-*`, etc.). Sans cette étape, les parcours peuvent échouer ou être non déterministes.

Depuis la racine du dépôt, avec les variables d’environnement chargées (par exemple le fichier `.env` utilisé pour le développement local, comme pour la stack Docker) :

```bash
# 1. Migrations
npx env-cmd -- pnpm --filter @vao/migrations exec knex --cwd ./src migrate:latest

# 2. Seeds dédiés aux tests E2E (répertoire seeds/e2e, via SEEDS_DIR)
SEEDS_DIR=e2e npx env-cmd -- pnpm --filter @vao/migrations exec knex --cwd ./src seed:run
```

En local sous **VS Code** on peut lancer la même chose sans retaper les commandes : **Tasks: Run Task**, puis les tâches définies dans `.vscode/tasks.json` — dans l’ordre, **Start Migrations** puis **Start Seeds (e2e)**.

Sur les environnements déployés, l’équivalent est assuré par le job de migrations (mise à jour du schéma puis seeds avec `SEEDS_DIR=e2e`).

## Configuration

- **Framework** : Playwright
- **Localisation** : `/e2e/`
- **Configuration** : `playwright.config.ts`
- **Navigateurs** : Chromium
- **Extension éditeur** : installer [Playwright Test for VS Code](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright) (Microsoft) pour exécuter ou déboguer les tests depuis la barre latérale, lancer un fichier ou un test isolé, et voir les traces sans passer uniquement par le terminal.

## Structure

```
e2e/
├── data/                     # Fichiers de test (PDF, images, etc.)
│   └── agrement.pdf
├── utils/                    # Helpers (URLs, utilisateurs, etc.)
├── global.setup.ts
└── register-personne-physique.spec.ts
```

Les seeds Knex utilisés pour l’E2E vivent sous `packages/migrations/src/seeds/e2e/` (ex. `e2e-reset.js`).

## Commandes

Ordre recommandé en local : stack démarrée → **migrations puis seeds E2E** (voir la section _Prérequis (local)_ ci-dessus) → lancement Playwright ci-dessous.

```bash
# Tests E2E en local
pnpm -w tests:e2e

# Interface graphique
pnpm -w tests:e2e:ui

# Mode debug
pnpm -w tests:e2e --debug

# Fichier ou scénario spécifique
pnpm -w tests:e2e e2e/register-personne-physique.spec.ts
pnpm -w tests:e2e --grep "create_organisateur"
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

## Helpers (`e2e/utils/helper.ts`)

### `alertLocator` (et `basicAlertLocator`)

Constantes de sélecteur CSS pour les messages **vue-dsfr** : les alertes exposent une zone de description dont l’`id` suit le motif `alert-v-xx-description` (ou `basic-v-xx-alert` pour `basicAlertLocator`). Plutôt que de dupliquer ces motifs (qui comprenne une regex) dans chaque test, on réutilise `alertLocator` avec `page.locator(alertLocator)` puis `.first()` ou `.nth(i)` lorsque plusieurs bandeaux sont affichés en même temps, et on assert le texte attendu avec `toContainText` (comme pour les retours de validation ou les confirmations d’étape).

### `addInputFile`

Les parcours qui **ajoutent un fichier** (PDF, pièce jointe) passent souvent par un lien ou un libellé qui ouvre le dialogue natif du navigateur : l’`<input type="file">` n’est pas toujours ciblé directement. `addInputFile(page, textLocator, cheminFichier)` enchaîne `waitForEvent("filechooser")`, un clic sur l’élément dont le texte contient `textLocator`, puis `setFiles` sur le file chooser. Pour un fichier versionné dans le dépôt, `getAgrementFile()` retourne par exemple le chemin vers `e2e/data/agrement.pdf`.

```typescript
import { alertLocator, addInputFile, getAgrementFile } from "./utils/helper";

await expect(page.locator(alertLocator).first()).toContainText("Message attendu");
await addInputFile(page, "Ajouter une copie de votre", getAgrementFile());
```

## Exemple de test

```typescript
test("exemple_inscription", async ({ page }) => {
  await page.goto(`${getUrl()}/connexion`);
  await expect(page.getByText("Connexion à VAO")).toBeVisible();
  await page.getByRole("button", { name: "Créer un compte" }).click();
  await page.getByPlaceholder("Veuillez saisir votre email").fill(username);
  await page.getByLabel("Mot de passe Veuillez saisir").fill(password);
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
pnpm -w tests:e2e --debug

# Tests avec trace
pnpm -w tests:e2e --trace on

# Inspection des sélecteurs
npx playwright codegen
```

## Documentation externe

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Best Practices](https://playwright.dev/docs/best-practices)
