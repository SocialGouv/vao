---
name: honorabilite-branch-review
description: >-
  Code review d'une branche Git vs origin/main
---

# Review de branche Honorabilite-v2

## Déclenchement

Demander explicitement, par exemple :

- « Fais une review de cette branche par rapport à origin/main »
- « @honorabilite-branch-review »
- « Review PR vs main »

L'agent charge ce skill et compare **la branche courante** à `origin/main`.

## Workflow

1. `git fetch origin main`
2. `git log origin/main..HEAD --oneline`
3. `git diff origin/main...HEAD --name-only`
4. Lire le diff complet : `git diff origin/main...HEAD`
5. Pour chaque fichier modifié, appliquer les critères ci-dessous
6. Vérifier les tests d'intégration dans `phr-server/src/__tests__/` (et serveurs backend concernés)

## Critères obligatoires

### Clean code

- Fonctions courtes, responsabilité unique
- Pas de double ternaire
- Cohérence avec le code environnant
- Transactions DB quand plusieurs écritures liées
- Validation backend alignée avec le front
- Réactivité Vue (computed/storeToRefs, pas de snapshot au setup)

### Tests d'intégration backend

- Tout nouveau comportement backend (`phr-server`, `phd-server`, `pp-server`) doit avoir un test d'intégration
- Les tests unitaires `shared-bridge` ne remplacent pas les tests d'intégration serveur
- Signaler les scénarios supprimés ou non couverts (filtres, rôles, exclusions SQL, etc.)

### Conventions modules

- Fichier `.ts` : uniquement `import` / `export` (pas de `module.exports` / `require`)
- Fichier `.js` : uniquement `require` / `module.exports` (pas de `import` / `export`)
- Fichier `.vue` : `<script lang="ts">` ou `<script setup lang="ts">`

## Format de sortie

**Uniquement les points négatifs**, structurés ainsi :

```markdown
### `chemin/fichier.ext`

- **L42** — Description du problème.
  - _Fix rapide_ : solution concrète en une phrase.
```

Règles :

- Toujours inclure le numéro de ligne
- Pas de points positifs, pas de résumé global
- Regrouper par fichier
- Prioriser les changements introduits par la branche (pas la dette préexistante hors diff)

## Checks automatisés utiles

Sur les fichiers du diff uniquement :

```bash
# TS avec module.exports ou require
git diff origin/main...HEAD --name-only -- '*.ts' | xargs rg -n 'module\.exports|require\('

# JS avec import/export ES6
git diff origin/main...HEAD --name-only -- '*.js' | xargs rg -n '^import |^export '

# Vue sans TypeScript
git diff origin/main...HEAD --name-only -- '*.vue' | while read f; do
  rg -l '<script setup>' "$f" && ! rg -q 'lang="ts"' "$f" && echo "$f"
done
```

## Périmètre typique du repo

| Zone                                                  | Tests intégration                 |
| ----------------------------------------------------- | --------------------------------- |
| `pakcages/backend/src/`                               | `pakcages/backend/src/__tests__/` |
| `packages/shared-bridge/`                             | `*.spec.ts` (unitaires)           |
| `packages/frontend-bo/`, `packages/frontend-usagers/` | conventions Vue/TS uniquement     |
