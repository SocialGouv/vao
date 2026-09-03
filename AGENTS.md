# AGENTS.md — VAO

Instructions always-on pour tout agent (Cursor, Claude Code, OpenCode, GitHub Copilot).

La config agent portable vit dans [`.claude/`](.claude/).

## Skills on-demand

Emplacement : `.claude/skills/<name>/SKILL.md`

| Skill                     | Quand l'appliquer                         | Fichier                                                                                              |
| ------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `branch-review`           | Review de branche / PR vs `origin/main`   | [`.claude/skills/branch-review/SKILL.md`](.claude/skills/branch-review/SKILL.md)                     |
| `write-unit-tests`        | Écrire / modifier des TU (`.spec.ts`)     | [`.claude/skills/write-unit-tests/SKILL.md`](.claude/skills/write-unit-tests/SKILL.md)               |
| `write-integration-tests` | Écrire / modifier des TI API (`.test.ts`) | [`.claude/skills/write-integration-tests/SKILL.md`](.claude/skills/write-integration-tests/SKILL.md) |

Si l'IDE ne charge pas les skills automatiquement (ex. Copilot), **lire le fichier du skill** dès que la demande correspond.

## Documentation produit

Pour toute tâche doc / métier / spécification : lire [`.claude/product.md`](.claude/product.md).

## TypeScript

S'applique à tous les `*.ts` :

- Typer explicitement quand c'est pertinent ; éviter `any`, préférer `unknown`
- `interface` / `type` pour les structures complexes ; generics pour le réutilisable
- Fonctions pures quand possible ; `map` / `filter` / `reduce` plutôt que des boucles impératives si adapté
- Gérer `null` / `undefined` avec `?.` et `??` ; destructuration
- `readonly` pour l'immuable ; type guards ; utility types (`Partial`, `Pick`, `Omit`, …)
- Unions discriminées pour les cas métier complexes
- Pas de commentaires / JSDoc inutiles
- `if` avec accolades :

```ts
if (condition) {
  return something;
}
```

## Conventions modules

- `.ts` : uniquement `import` / `export` (pas de `module.exports` / `require`)
- `.js` : uniquement `require` / `module.exports` (pas de `import` / `export`)
- `.vue` : TypeScript (`<script lang="ts">` ou `<script setup lang="ts">`)

## Tests (résumé — détails dans les skills)

- **TU** : même dossier, `.spec.ts`, fonctions pures uniquement → skill `write-unit-tests`
- **TI** : `packages/backend/src/__tests__/`, `supertest`, helpers, pas de mock services/DB → skill `write-integration-tests`

## Règles globales

- Front : découper en sous-composants par section fonctionnelle
- Clean code ; jamais de double ternaire
- Ne jamais proposer de lancer le serveur de développement
- Ne jamais proposer d'ajouter des fichiers à Git ni de committer
- Messages de commit : résumé le plus court possible, Conventional Commits
