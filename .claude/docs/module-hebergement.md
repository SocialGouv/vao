# Module Hébergement — Vue d'ensemble et routes

## 1. Objectif

Le module hébergement gère le cycle de vie des hébergements des accueils de loisirs déclarés par les organisateurs (FO) et consultés par les services de contrôle (BO) :

- création, modification, activation/désactivation d'hébergements ;
- gestion du **versionnage** (chaque mise à jour d'un hébergement actif archive la version précédente) ;
- recherche par SIREN (siège d'un organisme personne morale) ;
- export CSV côté back-office.

Deux mondes de données coexistent temporairement et sont **synchronisés en écriture** :

1. le monde **legacy** (table `front.hebergement`, logique historique du service `Hebergement.js`) ;
2. le nouveau monde **site + unité d'hébergement** (`front.site`, `front.site_organisme`, `front.unite_hebergement`), pilote quand le feature flag `MODULE_SITE_UNITE_HEBERGEMENT` est actif (lecture uniquement).

---

## 2. Architecture des données

### 2.1 Tables

| Table | Rôle | Points clés |
|---|---|---|
| `front.hebergement` | Legacy : l'hébergement "métier" | `id` (PK, séquentiel), `hebergement_id` (uuid stable), `current` (booléen, version courante), adresses, locaux, transports, statut, fichiers |
| `front.site` | Nouveau monde : le site physique | `id` (PK), `nom_site_officiel`, `descriptif`, `adresse_id` |
| `front.site_organisme` | Lien site ↔ organisme | `site_id`, `organisme_id` |
| `front.unite_hebergement` | Nouveau monde : la version d'hébergement liée à un site | `id` **=** `hebergement.id`, `hebergement_id` (uuid) **stable** entre versions, `current`, `statut_id`, `site_id`, `organisme_id`, champs locaux/accessibilité dérivés |

### 2.2 Contraintes d'identité (décisives)

- `unite_hebergement.id` (numérique) == `hebergement.id` numérique : la lecture de l'unité courante d'un hébergement se fait par `getUniteHebergementById(hebergement.id)`.
- `unite_hebergement.hebergement_id` == uuid métier `hebergement.hebergement_id`, **stable** à travers les versions (historisation).
- Index unique partiel : `(hebergement_id) WHERE "current" IS TRUE` → une seule unité courante par hébergement.
- La migration d'alignement (cf. §7) parsème les tables **sans avoir besoin d'upsert** : après migration, l'unité existe toujours pour un `id` donné.

---

## 3. Routes backend — Montage

```
app.use(`/hebergement`, hebergementRoute);          // FO (usagers)
app.use(`/admin/hebergement`, adminHebergementRoute); // BO (back-office)
```

Source : `packages/backend/src/app.ts:103-104`.

Toutes les routes FO et BO sont protégées par authentification JWT (`checkJWT` / `boCheckJWT`).

---

## 4. Routes FO (usagers) — `/hebergement`

Fichier : `packages/backend/src/usagers/hebergement/hebergement.route.ts`
Contrôleur : `packages/backend/src/usagers/hebergement/hebergement.controller.ts`

### 4.1 Tableau récapitulatif

| Méthode | Chemin | Middlewares | Contrôleur | Statut prérequis | Description |
|---|---|---|---|---|---|
| `GET` | `/hebergement/` | `checkJWT` | `getList` | — | Liste paginée/recherchable/triée des hébergements |
| `GET` | `/hebergement/siren/:siren` | `checkJWT` | `getBySiren` | — | Recherche d'hébergements par SIREN |
| `GET` | `/hebergement/:id` | `checkJWT`, `checkPermissionHebergement`, validator | `getOne` | — | Détail complet d'un hébergement (lecture) |
| `POST` | `/hebergement/` | `checkJWT`, validator flag | `post` | — | Création d'un hébergement **actif** |
| `POST` | `/hebergement/brouillon` | `checkJWT`, validator flag | `postBrouillon` | — | Création d'un hébergement **brouillon** (validation allégée) |
| `PUT` | `/hebergement/:id/brouillon` | `checkJWT`, `checkStatutHebergement(BROUILLON)`, validator flag | `updateBrouillon` | BROUILLON | Modification d'un brouillon (sans versionnage) |
| `PUT` | `/hebergement/:id/activate` | `checkJWT`, `checkStatutHebergement(BROUILLON)`, validator flag | `activate` | BROUILLON | Passe un brouillon en actif (sans versionnage) |
| `PUT` | `/hebergement/:id/desactivate` | `checkJWT`, `checkStatutHebergement(ACTIF)`, `checkPermissionHebergementUser` | `desactivate` | ACTIF | Désactive un hébergement actif (versionnage) |
| `PUT` | `/hebergement/:id/reactivate` | `checkJWT`, `checkStatutHebergement(DESACTIVE)`, `checkPermissionHebergementUser` | `reactivate` | DESACTIVE | Réactive un hébergement désactivé |
| `POST` | `/hebergement/:id` | `checkJWT`, `checkStatutHebergement(ACTIF)`, `checkPermissionHebergement`, validator flag | `update` | ACTIF | Mise à jour d'un hébergement actif (versionnage) |

> **Note contrat** : la mise à jour d'un hébergement actif est un **`POST /hebergement/:id`** (et non un `PUT /hebergement/:id`), pour coller au contrat consommé par `frontend-usagers` (`store.updateOrCreate` : `POST /hebergement` pour créer, `POST /hebergement/:id` pour modifier).

### 4.2 Détail des contrôleurs

#### `getList` — GET `/hebergement/`
- Lit `req.query.search` (JSON : filtres, ex. `organismeId`, `statut`).
- Récupère l'identifiant d'organisme de l'utilisateur connecté (`FOUser.getUserOrganisme`).
- Si le filtre concerne un **autre organisme**, et que l'utilisateur connecté est l'organisme **siège** de sa personne morale (`Organisme.getOne({ use_id: userId })` puis `Organisme.getSiege` sur le SIRET), on liste les hébergements du SIREN du siège (`Hebergement.getBySiren`).
- Sinon, liste les hébergements de l'utilisateur (`Hebergement.getByUserId`).
- Erreur → `400` avec un message générique.

#### `getBySiren` — GET `/hebergement/siren/:siren`
- Retourne les hébergements d'un SIREN donné (`Hebergement.getBySiren`).

#### `getOne` — GET `/hebergement/:id`  ⭐ (lecture irriguée par le nouveau monde)
1. Charge l'hébergement legacy (`Hebergement.getById`) ; `404` si introuvable.
2. Si le feature flag `MODULE_SITE_UNITE_HEBERGEMENT` est **actif** :
   - charge l'unité courante (`HebergementServiceShared.getUniteHebergementById(id)`) ;
   - applique un **overlay sélectif** de l'unité sur l'hébergement legacy (`applyUniteToHebergement`) : les champs de l'unité ne remplacent le legacy que s'ils sont non-nuls (`??`) ;
   - résout les métadonnées des fichiers (pièces justificatives) via `getFileMetaData` avec repli sur le legacy (`resolveFileMetaData`) ;
   - retourne l'objet fusionné.
3. Si le flag est inactif (ou unité absente) : retourne l'hébergement legacy tel quel.

#### `post` — POST `/hebergement/`
- La validation du body est réalisée par le middleware de route (`requestValidatorMiddlewareByFeatureFlag`, cf. §4.2.1) ; le contrôleur consomme `req.validatedBody`.
- Récupère l'organisme de l'utilisateur, appelle `Hebergement.create(userId, organismeId, ACTIF, hebergement)`.
- Réponse `200` avec `{ id, message }`.

#### `postBrouillon` — POST `/hebergement/brouillon`
- Idem `post` mais variant brouillon des schémas (champs optionnels) et statut `BROUILLON`.

#### `update` — POST `/hebergement/:id`
- Préconditions middlewares : hébergement courant **ACTIF** et permission de l'utilisateur sur cet hébergement.
- Validation du body via le middleware flag (cf. §4.2.1), puis `Hebergement.update(userId, hebergementId, hebergement, ACTIF)` → **versionnage**.
- Retour `200` vide (`sendStatus(200)`).

#### `updateBrouillon` — PUT `/hebergement/:id/brouillon`
- Précondition : hébergement courant **BROUILLON**.
- Validation via le middleware flag, puis `Hebergement.updateWithoutHistory` → modification **en place** (pas de nouvelle version).
- Retour `200` vide.

#### `activate` — PUT `/hebergement/:id/activate`
- Précondition : hébergement courant **BROUILLON**.
- Validation via le middleware flag, puis `Hebergement.updateWithoutHistory(..., ACTIF)` → le brouillon devient actif **sans versionnage** (on ne conserve pas l'historique d'un brouillon).
- Retour `200` vide.

#### `desactivate` — PUT `/hebergement/:id/desactivate`
- Préconditions : hébergement courant **ACTIF** + permission utilisateur.
- Charge l'hébergement, appelle `Hebergement.update(..., DESACTIVE)` → **versionnage** + changement de statut.
- Retour `200` vide.

#### `reactivate` — PUT `/hebergement/:id/reactivate`
- Précondition : hébergement courant **DESACTIVE** + permission utilisateur.
- Contrôle d'existence (`getStatut`), appelle `Hebergement.updateStatut(..., ACTIF)` → changement de statut **en place**.
- Retour `200` vide.

### 4.2.1 Validation d'entrée flag-aware

Les 5 routes d'écriture (`post`, `postBrouillon`, `updateBrouillon`, `activate`, `update`) sont montées avec `requestValidatorMiddlewareByFeatureFlag(validator, featureFlagName)` (source : `packages/backend/src/middlewares/requestValidatorMiddleware.ts`), branché **juste après `checkJWT`**.

Le middleware résout `FeatureFlagService.isFeatureAvailable(MODULE_SITE_UNITE_HEBERGEMENT)` **à chaque requête** et choisit le schéma yup correspondant parmi les contrats partagés (`packages/shared-bridge/src/routes/usagers/hebergement/schema.ts`) :

| Flag | Schéma appliqué | Payload attendu |
|---|---|---|
| ON | `uniteHebergementBodySchema` (brouillon/complet) | `{ coordonnees, nom, uniteData }` (`UniteHebergementPayloadDto`, situé dans `dto/hebergement.dto.ts`) |
| OFF | `legacyHebergementBodySchema` (brouillon/complet) | `{ coordonnees, informationsLocaux, informationsTransport, nom, ... }` (`LegacyHebergementPayload`) |

Le contrôleur lit `req.validatedBody` ; le helper `toHebergementInput` discrimine le payload avec `"uniteData" in body` et convertit le flux unité vers le payload legacy via `uniteToLegacyPayload` (`hebergements.mapping.ts`) : `accessibilitePmr` → `accessibilite` (`accessible`/`non_adapte`), `separationHommeFemme` → `chambresUnisexes`, `litsSuperposes` → `nombreLitsSuperposes` (1/0), `nombreCouchageTotal` → `nombreLits`/`nombreMaxPersonnesCouchage` ; `type`, `descriptionLieuHebergement` et `prestationsHotelieres` sont nuls/vides sur le flux unité.

> Spécificités yup 1.4 : `.when()` utilise `otherwise` (et non `else`, silencieusement ignoré dans le legacy) — la validation non-brouillon est désormais **stricte** ; les erreurs de date s'allèguent via `.date().typeError(...)`.
> **Assomption** : sur le flux unité, `site.hebergement_type_id` et `site.descriptif` sont NULL (l'`uniteData` ne porte ni type ni descriptif).
> Les routes sans body (GET, `desactivate`, `reactivate`) sont inchangées.

### 4.3 Middlewares FO

| Middleware | Rôle |
|---|---|
| `checkJWT` | Authentification utilisateur |
| `checkPermissionHebergement` | L'utilisateur appartient à l'organisme (SIREN) propriétaire de l'hébergement (`getByIdAndMySiren`) → sinon `403` |
| `checkPermissionHebergementUser` | `getIsHebergementAutoriseForUserId` → sinon `403` (utilisé pour désactiver/réactiver) |
| `checkStatutHebergement(statut)` | Le statut courant de l'hébergement doit correspondre, sinon `403` ; introuvable → `404` |

---

## 5. Routes BO (back-office) — `/admin/hebergement`

Fichier : `packages/backend/src/admin/hebergement/hebergement.route.ts`
Contrôleur : `packages/backend/src/admin/hebergement/hebergement.controller.ts`

| Méthode | Chemin | Middlewares | Contrôleur | Description |
|---|---|---|---|---|
| `GET` | `/admin/hebergement/` | `boCheckJWT`, `getDepartements` | `getList` | Liste paginée/triée des hébergements filtrés par départements du BO |
| `GET` | `/admin/hebergement/extract` | `boCheckJWT`, `getDepartements` | `getExtract` | Export CSV (headers `text/csv`) |
| `GET` | `/admin/hebergement/:id` | `boCheckJWT`, `checkStatutHebergement(ACTIF)`, validator | `getOne` | Détail d'un hébergement **actif** (lecture legacy pure) |

- `getList` / `getExtract` s'appuient sur `Hebergement.getByDepartementCodes` (limité aux départements autorisés du BO).
- `getExtract` génère un CSV avec les colonnes : nom, département, adresse, téléphone, courriel, date de visite préalable, réglementation ERP.
- `getOne` retourne l'hébergement legacy `getById` ; `404` si introuvable.

> Les contrats `shared-bridge` admin déclarent aussi `POST`/`PUT` (`/admin/hebergement/`, `/admin/hebergement/{id}`) mais **ne sont pas exposés** par le routeur backend (lecture seule côté admin pour le moment).

---

## 6. Contrats typés — `shared-bridge`

Les contrats API vivent dans `packages/shared-bridge/src/routes/{admin,usagers}/hebergement/` et sont consommés par les fronts (validation yup + typage) et par le backend (types de requêtes/réponses).

| Contrat | Méthode | Chemin | Payload |
|---|---|---|---|
| `usagers GetList` | GET | `/hebergement/` | — |
| `usagers GetOne` | GET | `/hebergement/{id}` | `{ hebergement: HebergementDto \| null }` |
| `usagers Post` | POST | `/hebergement/` | `UsagerHebergementBodyDto` (flag `legacy` \| `unite`) |
| `usagers PostBrouillon` | POST | `/hebergement/brouillon` | `UsagerHebergementBodyDto` |
| `usagers PostById` | POST | `/hebergement/{id}` | `UsagerHebergementBodyDto` |
| `usagers PutBrouillon` | PUT | `/hebergement/{id}/brouillon` | `UsagerHebergementBodyDto` |
| `usagers PutActivate` | PUT | `/hebergement/{id}/activate` | `UsagerHebergementBodyDto` |
| `admin GetList` | GET | `/admin/hebergement/` | — |
| `admin GetOne` | GET | `/admin/hebergement/{id}` | `{ hebergement: HebergementDto \| null }` |
| `admin Post` | POST | `/admin/hebergement/` | `HebergementDto` |
| `admin Put` | PUT | `/admin/hebergement/{id}` | `HebergementDto` |

Les contrats d'écriture FO sont **double-flavored** : chaque schéma expose une variante `legacy` (`informationsLocaux`/`informationsTransport`) et une variante `unite` (`uniteData`, cf. §4.2.1), sélectionnées à l'exécution par le middleware flag. Les DTO associés : `UsagerHebergementBodyLegacyDto`, `UsagerHebergementBodyUniteDto`, `UsagerHebergementBodyDto` (`packages/shared-bridge/src/dto/hebergement.dto.ts`).

---

## 7. Synchronisation des deux mondes (double écriture)

Le service legacy `packages/backend/src/services/hebergement/Hebergement.js` **ventile désormais lui-même** vers le nouveau monde, **dans la même transaction** que l'écriture legacy (une seule `BEGIN`/`COMMIT`, rollback global en cas d'erreur — pas de risque de « hébergement créé sans site/unité ») :

| Opération legacy | Synchronisation nouveau monde |
|---|---|
| `create` (`module.exports.create`) → `syncSiteAndUniteOnCreate` | Crée `front.site` + `front.site_organisme`, puis `unite_hebergement` avec `id = hebergement.id` et `hebergement_id = uuid` renvoyés par `RETURNING id, hebergement_id` |
| `update` (versionnage) | Récupère l'unité courante (`getUniteHebergementById`), puis `HebergementServiceShared.updateUniteHebergement` : **archive** l'unité courante (`current=false`) et **crée** une nouvelle unité avec `id = nouveau hebergement.id`, même uuid, et héritage de `organismeId`/`siteId`/`createdBy` depuis l'unité courante |
| `updateWithoutHistory` (brouillon / activation) | `HebergementServiceShared.updateUniteHebergementInPlace` : **UPDATE en place** de l'unité (même `id`) |
| `updateStatut` (réactivation) | `UPDATE front.unite_hebergement SET statut_id = (SELECT id FROM front.hebergement_statut WHERE value = $2) ... WHERE id = $1 AND "current" IS TRUE` |

### 7.1 Peuplement du site et des coordonnées (`site` / `site_organisme`)

À la **création** comme à la **mise à jour** (versionnée ou en place), on alimente / met à jour le site et les coordonnées du site selon le même mapping que la migration d'alignement :

| Nœud | Colonne cible | Source |
|---|---|---|
| `front.site` | `adresse_id` | `coordonnees.adresse` (persistée via `saveAdresse`, dédupliquée par clé INSEE / label) |
| `front.site` | `nom_site_officiel` | `nom` |
| `front.site` | `hebergement_type_id` | `informationsLocaux.type` (valeur résolue vers `front.hebergement_type`) |
| `front.site` | `descriptif` | `informationsLocaux.descriptionLieuHebergement` |
| `front.site_organisme` | `nom_site` | `nom` |
| `front.site_organisme` | `resp_nom_prenom` | `coordonnees.nomGestionnaire` |
| `front.site_organisme` | `resp_telephone` | `coordonnees.numTelephone1` (le 2e numéro est abandonné, seul `resp_telephone` existe dans le nouveau monde) |
| `front.site_organisme` | `resp_email` | `coordonnees.email` |

- `site/site_organisme` sont des entités **stables entre versions** : le site est créé une fois et référencé par les unités successives (héritage de `siteId` sur le versionnage). La mise à jour se fait **en place** (UPDATE / upsert `ON CONFLICT (site_id, organisme_id) DO UPDATE`).
- Services : `createSite` et `updateSite` de `HebergementServiceShared` (résolution `adresse` + `hebergement_type` + upsert `site_organisme`). Les méthodes du service shared acceptent un `tx` (`PoolClient`) optionnel via le helper `withTx` : si un client transactionnel est fourni, elles s'exécutent **dans la transaction parente** (cas du service legacy) ; sinon elles ouvrent leur propre transaction. De même, `getUniteHebergementById` du repository accepte un `tx` pour lire dans la transaction en cours.

### Feature flag — rôle

- `MODULE_SITE_UNITE_HEBERGEMENT` (service `FeatureFlagService`) gate **la lecture** (`getOne` FO, cf. §4.2) **et le format d'entrée** des écritures FO (cf. §4.2.1 : payload `uniteData` quand le flag est ON, payload legacy sinon).
- L'écriture est **toujours** synchronisée vers le nouveau monde (avec ou sans flag) : c'est un choix assumé — la migration d'alignement garantit la cohérence initiale et le nouveau monde doit rester à jour pour servir la lecture dès l'activation du flag.

---

## 8. Migrations

| Migration | Contenu |
|---|---|
| `20260928155011_front.unite_hebergement__alter_id.js` | `unite_hebergement.id` passe en `INT4` **sans séquence** (FK `id → hebergement.id`) ; exige une table vide ; index unique partiel `(hebergement_id) WHERE "current" IS TRUE` |
| `20260929071549_migrate_hebergement_to_site_unite_hebergement.js` | Alignement : 1 `site` + `site_organisme` par `hebergement_id` et `hebergement.site_id` renseigné ; 1 `unite_hebergement` par version (id = `hebergement.id`, `current` préservé) ; champs dérivés : `accessibilite_pmr` booléen, `lits_superposes` dérivé de `nombre_lits_superposes > 0`, `accessibilite_precision` nu |

Le mapping entre legacy et unité vit dans `packages/backend/src/shared/hebergements/hebergements.mapping.ts` : merge sélectif (`??`) et conversion majorité → accessibilité (`non_adapte`).

---

## 9. Fichiers de référence

- Routes : `packages/backend/src/usagers/hebergement/hebergement.route.ts`, `packages/backend/src/admin/hebergement/hebergement.route.ts`
- Contrôleurs : `packages/backend/src/usagers/hebergement/hebergement.controller.ts`, `packages/backend/src/admin/hebergement/hebergement.controller.ts`
- Service legacy (double écriture) : `packages/backend/src/services/hebergement/Hebergement.js`
- Nouveau monde : `packages/backend/src/shared/hebergements/hebergements.service.ts`, `hebergements.repository.ts`, `hebergements.mapping.ts`
- Contrats : `packages/shared-bridge/src/routes/{usagers,admin}/hebergement/*.ts`
- Front FO : `packages/frontend-usagers/src/stores/hebergement.ts`, `packages/frontend-usagers/src/services/hebergementService.ts`

---

## 10. Points d'attention (tests)

- `usagers/herbergement.test.ts` : **24 tests passent** — dont 4 sur le flag d'entrée (`400` body legacy si flag ON, `400` body unité si flag OFF, `200` création unité + vérifs `site`/`site_organisme`/`unite_hebergement`/legacy, `200` versionnage unité via `POST /:id`). Les échecs de recherche SIREN siège précédemment notés sont résolus dans ce périmètre.
- `admin/herbergement.test.ts` : `GET /hebergement/admin/:id` attend `200`, reçoit `404` — **pré-existant** sur le commit de base.
- `usagers/sejour.test.ts` : échecs massifs — **pré-existants** (observés à l'identique sur le commit de base).
- Les timeouts (config `jest.config.js` : 10 s, 30 s si `CI`) sont des limitations de l'environnement local, pas des régressions.