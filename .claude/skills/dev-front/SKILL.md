---
name: dev-front
description: >-
  Implement or modify VAO frontend (Nuxt, Vue 3, Pinia, vue-dsfr,
  vee-validate) in frontend-usagers, frontend-bo, and shared-ui. Use when
  working on pages, components, stores, services, forms, or DSFR UI.
---

# Développement frontend VAO

Lire [`AGENTS.md`](../../../AGENTS.md). Accessibilité : skill `review-rgaa`. Utils purs : skill `write-unit-tests`. Contrats API : skill `dev-back`.

## Packages

| Package                     | App                                             |
| --------------------------- | ----------------------------------------------- |
| `packages/frontend-usagers` | OVA (front)                                     |
| `packages/frontend-bo`      | Agents (admin)                                  |
| `packages/shared-ui`        | Composants / composables / schémas yup partagés |
| `packages/shared-bridge`    | DTO, constantes, types de routes, yup serveur   |

Stack : Nuxt, Vue 3, Pinia, vee-validate, yup, **vue-dsfr** + classes `fr-*`.

## Découpage

```
pages/                 # orchestration (1 h1, breadcrumb, stepper)
components/<domaine>/  # une section fonctionnelle = un composant
stores/                # Pinia (état + appels service)
services/              # buildRequest typé, zéro métier UI
utils/                 # fonctions pures (+ .spec.ts)
```

- Page = assemblage. Pas de gros formulaire inline dans la page.
- Sous-composants par section (ex. agrément : `coordonnees`, `dossier`, `projets`, `synthese`).
- UI commune aux deux apps → `shared-ui` (export dans `packages/shared-ui/src/components/index.ts`).
- Types / enums / dates / erreurs → `@vao/shared-bridge`, pas de DTO dupliqué.

Référence : `packages/frontend-usagers/src/pages/agrement/[[agrementId]].vue` + `components/agrement/`.

## Workflow d'une feature

1. Le contrat API existe dans `shared-bridge` (sinon le créer via skill `dev-back`).
2. `services/<domaine>Service.ts` : uniquement `buildRequest<XxxRoutes["GetList"]>({ path, method, params, query, body })`.
3. Store Pinia : état, getters, actions qui appellent le service.
4. Composants de section : formulaire vee-validate + yup, DSFR, emit vers la page.
5. Page : layout DSFR (`fr-container`, `fr-grid-row`, `fr-col-*`), branchement store / events.
6. TU pour les utils purs touchés.

## Vue / TypeScript

- `<script setup lang="ts">` (ou `<script lang="ts">`). Pas de SFC JS.
- `defineProps` / `defineEmits` typés.
- Réactivité : `storeToRefs(store)` et `computed`. Ne pas copier un state Pinia dans une constante au `setup` (perte de réactivité).
- Pas de double ternaire. `if` avec accolades.
- Auto-import Nuxt des composants (`components/agrement/coordonnees.vue` → `AgrementCoordonnees`).

## Appels API

```ts
import { buildRequest } from "~/utils/fetchBackend";

const { agrements } = await buildRequest<AgrementUsagersRoutes["GetList"]>({
  path: "/agrements",
  method: "GET",
  query,
})();
```

Pas de `$fetch` / URL en dur dans un composant. Fichiers : `buildRequestFile`.

## Formulaires

- `useForm` + `useField` (vee-validate) + schéma **yup**.
- Réutiliser les schémas `shared-ui/src/schema/` (email, téléphone, nom, …) et les contraintes métier de `shared-bridge` quand elles existent.
- Champs DSFR : `DsfrInputGroup` / `DsfrSelect` / `DsfrRadioButton` avec `label-visible`. Erreur via `error-message` du champ, pas un texte orphelin.
- Groupes de radios / cases : `fieldset` + `legend` (composants DSFR).
- Lecture seule : `DisplayInput` / `DisplayLabel` (`shared-ui` ou `UtilsDisplayInput`).
- Toaster (`useToaster` de `shared-ui`) : erreurs `role: "alert"` ; si `title` est passé, `titleTag: "h2"` (ne pas sauter de niveau).

## DSFR / a11y (minimum en implémentation)

- Composants **vue-dsfr** ou équivalents `shared-ui` (`DsfrDataTableV2`, `FileUpload`, `ValidationModal`, `Skiplinks`, …). Pas de HTML/CSS custom qui duplique le DSFR.
- Une seule `<h1>` par page ; titres suivants sans saut de niveau.
- Icônes décoratives : `aria-hidden="true"`.
- Action = `DsfrButton` ; navigation = `NuxtLink` / `DsfrLink`.
- Cibles skiplinks déjà dans le layout : `#menu`, `#content`, `#footer` — ne pas les retirer.
- Détail : skill `review-rgaa`.

## Checklist

- [ ] Découpé par section fonctionnelle
- [ ] Service typé `shared-bridge` + store Pinia
- [ ] `<script setup lang="ts">`
- [ ] `storeToRefs` / `computed` (pas de snapshot)
- [ ] yup + vee-validate, labels DSFR visibles
- [ ] Pas de DTO local qui clone `shared-bridge`
- [ ] TU `.spec.ts` pour les utils purs
