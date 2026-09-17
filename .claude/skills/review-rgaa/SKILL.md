---
name: review-rgaa
description: >-
  Review VAO Vue/DSFR UI against RGAA 4.1.2. Use when the user asks for an
  RGAA review, accessibilité / a11y check, audit de conformité, or
  @review-rgaa.
---

# Review RGAA VAO

Référentiel : **RGAA 4.1.2**. UI de référence : **DSFR** (`vue-dsfr`, classes `fr-*`, composants `@vao/shared-ui`).

Ne pas lancer le serveur. Review **sur le code** (et le diff si une branche est en jeu).

## Déclenchement

- Fichiers / pages nommés → ces SFC + composants enfants + layout.
- « review RGAA de la branche » → `git diff origin/main...HEAD` limité à `*.vue`, layouts, CSS touché.
- Sinon → les fichiers frontend du working tree / conversation.

Apps : `packages/frontend-usagers`, `packages/frontend-bo`, `packages/shared-ui`.

## Workflow

1. Identifier les pages et composants concernés (y compris `shared-ui` importé).
2. Relire template + script : titres, formulaires, tableaux, modales, messages, images, liens/boutons, clavier.
3. Vérifier le layout (`Skiplinks`, `#menu` / `#content` / `#footer`, `html lang="fr"` déjà dans `nuxt.config.ts`).
4. Appliquer la checklist. Signaler uniquement les **non-conformités introduites ou touchées** (pas toute la dette hors périmètre).
5. Sortir au format ci-dessous.

## Checklist (thèmes RGAA utiles ici)

### Structure (crit. 9, 8)

- [ ] Un seul `<h1>` visible par page ; pas de saut de niveau (`h1` → `h3`)
- [ ] `DsfrBreadcrumb` si navigation multi-niveaux
- [ ] Langue de page `fr` ; passages dans une autre langue : `lang`
- [ ] `main#content[role=main]` conservé

### Formulaires (crit. 11)

- [ ] Chaque champ a un **label visible** associé (`DsfrInputGroup` `label-visible`, pas le placeholder comme seul nom)
- [ ] Obligatoire indiqué (mention page et/ou `required` / légende DSFR)
- [ ] Erreurs liées au champ (`error-message`) + résumé `DsfrAlert role="alert"` si besoin
- [ ] Radios / checkbox groupés : `fieldset` + `legend`
- [ ] Bouton submit avec intitulé explicite (pas « OK » seul)

### Liens, boutons, scripts (crit. 6, 7, 12)

- [ ] Navigation = lien (`NuxtLink`, `DsfrLink`) ; action = `DsfrButton`
- [ ] Intitulé accessible (pas « Cliquez ici », pas icône seule sans `aria-label` / texte)
- [ ] Pas de `@click` sur `div`/`span` sans rôle bouton, clavier et focus
- [ ] Modales : `ValidationModal` / DSFR (focus piégé, fermeture Échap, retour focus)
- [ ] Skiplinks `#menu`, `#content`, `#footer` toujours présents dans le layout

### Images, icônes (crit. 1)

- [ ] Image informative : `alt` pertinent
- [ ] Image / icône décorative : `alt=""` ou `aria-hidden="true"` (pattern VAO : `fr-icon-*` décoratifs)

### Tableaux (crit. 5)

- [ ] `DsfrDataTableV2` / wrappers `shared-ui` plutôt qu’un `<table>` nu
- [ ] En-têtes de colonnes ; caption ou nom accessible si le tableau n’est pas décoratif

### Messages et toasts (crit. 7, 11)

- [ ] Erreur bloquante : `role="alert"` (toaster ou `DsfrAlert`)
- [ ] Info non critique : `role="status"` (défaut toaster)
- [ ] Si le toast a un `title`, `titleTag: "h2"` (pas `h1`, pas de saut)

### Couleurs, présentation (crit. 3, 10)

- [ ] L’information ne repose pas que sur la couleur (badge + texte, pas pastille seule)
- [ ] Classes DSFR pour espacements / grille ; pas de CSS qui casse le focus visible (`outline: none` sans alternative)
- [ ] Zoom / espacement : pas de `px` figés qui cassent le reflow des textes

### Composants projet à réutiliser

| Besoin         | Composant                                       |
| -------------- | ----------------------------------------------- |
| Fichier        | `FileUpload` / `MultiFilesUpload` (`shared-ui`) |
| Tableau paginé | `DsfrDataTableV2`, `TableWithBackendPagination` |
| Toaster        | `useToaster` + `Toaster` dans le layout         |
| Accès rapide   | `Skiplinks` (layout)                            |
| Confirmation   | `ValidationModal`                               |

## Format de sortie

**Uniquement les points négatifs** :

```markdown
### `chemin/fichier.vue`

- **L42** — Critère RGAA x.x — Description du problème.
  - _Fix rapide_ : solution concrète en une phrase (composant DSFR / attribut).
```

- Toujours un numéro de ligne
- Pas de points positifs, pas de score global
- Regrouper par fichier
- Prioriser le diff / les fichiers demandés
