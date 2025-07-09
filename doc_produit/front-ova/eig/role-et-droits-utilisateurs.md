---
layout:
  width: default
  title:
    visible: true
  description:
    visible: true
  tableOfContents:
    visible: true
  outline:
    visible: true
  pagination:
    visible: false
---

# Rôle et droits utilisateurs

Le système de gestion des Événements Indésirables Graves (EIG) implémente un modèle de permissions basé sur deux rôles principaux :

* **EIG\_LECTURE** : Accès en lecture seule
* **EIG\_ECRITURE** : Accès complet (lecture + écriture)

## Tableau des rôles et permissions

| Rôle                 | Code Backend   | Code Frontend  | Permissions             | Actions autorisées                                                                                                                                                                                                                                                               |
| -------------------- | -------------- | -------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Lecture seule**    | `Eig_Lecture`  | `EIG_LECTURE`  | Consultation uniquement | <p>• Consulter la liste des EIG<br>• Consulter un EIG détaillé<br>• Voir les statuts et types d'événements<br>• Accéder aux documents joints</p>                                                                                                                                 |
| **Lecture/Écriture** | `Eig_Ecriture` | `EIG_ECRITURE` | Accès complet           | <p>• Toutes les permissions de lecture<br>• Créer un nouvel EIG<br>• Modifier un EIG en statut BROUILLON<br>• Supprimer un EIG en statut BROUILLON<br>• Déposer un EIG (passage ENVOYE)<br>• Gérer les documents joints<br>• Attribuer des rôles EIG aux autres utilisateurs</p> |

## Contrôles d'accès par fonctionnalité

### Frontend (Interface utilisateur)

| Fonctionnalité         | EIG\_LECTURE | EIG\_ECRITURE         | Contrôle                                        |
| ---------------------- | ------------ | --------------------- | ----------------------------------------------- |
| **Menu de navigation** | ✅ Affiché    | ✅ Affiché             | Vérification des rôles dans `useMenuNavItem.js` |
| **Liste des EIG**      | ✅ Accès      | ✅ Accès               | Middleware `check-roles.js`                     |
| **Consultation EIG**   | ✅ Accès      | ✅ Accès               | Middleware `check-roles.js`                     |
| **Création EIG**       | ❌ Bloqué     | ✅ Accès               | Vérification dans `useMenuNavItem.js`           |
| **Modification EIG**   | ❌ Bloqué     | ✅ Si statut BROUILLON | `eigStore.canModify`                            |
| **Suppression EIG**    | ❌ Bloqué     | ✅ Si statut BROUILLON | `canDelete()` dans `utils/eig.js`               |
| **Gestion des rôles**  | ❌ Bloqué     | ✅ Accès               | `canUpdateRole` dans `Compte.vue`               |

### Backend (API)

| Endpoint | Méthode | EIG\_LECTURE | EIG\_ECRITURE | Middleware |
|----------|---------|-------------|---------------|------------|
| `/eig/me` | GET | ✅ | ✅ | `checkPermissionEIG({ action: "READING" })` |
| `/eig` | POST | ❌ | ✅ | `checkPermissionEIG({ action: "CREATION" })` |
| `/eig/:id` | PUT | ❌ | ✅ | `checkPermissionEIG({ action: "MODIFICATION" })` |
| `/eig/:id` | DELETE | ❌ | ✅ | `checkPermissionEIG({ action: "DELETION" })` |
| `/eig/depose/:id` | POST | ❌ | ✅ | `checkPermissionEIG({ action: "MODIFICATION" })` |
| `/fo-user/roles/:userId` | POST | ❌ | ✅ | `checkPermissionFoRole({ role: "EIG_ECRITURE" })` |

## Rôles par type d'utilisateur

### Utilisateurs OVA (Front Office)

Les utilisateurs OVA sont les organisateurs de vacances adaptées qui utilisent le frontend pour déclarer leurs séjours et EIG.

| Rôle EIG | Permissions | Actions autorisées | Contrôles spécifiques |
|----------|-------------|-------------------|----------------------|
| **Aucun rôle EIG** | ❌ Accès bloqué | • Aucun accès aux fonctionnalités EIG | • Redirection vers `/connexion` avec code 403 |
| **EIG_LECTURE** | ✅ Lecture seule | • Consulter la liste des EIG de son organisme<br>• Consulter un EIG détaillé<br>• Voir les statuts et types d'événements<br>• Accéder aux documents joints | • Vérification d'appartenance à l'organisme<br>• Middleware `check-roles.js` |
| **EIG_ECRITURE** | ✅ Accès complet | • Toutes les permissions de lecture<br>• Créer un nouvel EIG<br>• Modifier un EIG en statut BROUILLON<br>• Supprimer un EIG en statut BROUILLON<br>• Déposer un EIG (passage ENVOYE)<br>• Gérer les documents joints<br>• Attribuer des rôles EIG aux autres utilisateurs de son organisme | • Vérification d'appartenance à l'organisme<br>• Contrôle des statuts (modification/suppression uniquement en BROUILLON)<br>• Vérification de l'éligibilité du séjour |

### Agents (Back Office)

Les agents sont les utilisateurs du back office qui gèrent les EIG et ont des permissions étendues.

| Rôle Back Office | Permissions EIG | Actions autorisées | Contrôles spécifiques |
|------------------|-----------------|-------------------|----------------------|
| **Agent avec rôle `eig`** | ✅ Accès complet | • Consulter tous les EIG (tous organismes)<br>• Marquer un EIG comme lu (DDETS/DREETS)<br>• Accéder aux EIG par déclaration de séjour<br>• Voir les notifications et emails | • Vérification du rôle `eig` automatique<br>• Contrôle des statuts (pas d'accès aux BROUILLON)<br>• Vérification du territoire (DDETS/DREETS) |
| **Agent sans rôle `eig`** | ❌ Accès bloqué | • Aucun accès aux fonctionnalités EIG | • Middleware `bo-check-role.js` avec `["eig"]` |

#### Permissions spécifiques des agents

| Fonctionnalité | Agent avec rôle `eig` | Contrôle |
|----------------|----------------------|----------|
| **Liste des EIG** | ✅ Accès à tous les EIG | `boCheckRoleEig` |
| **Consultation EIG** | ✅ Accès détaillé | `checkPermissionBOEIG` |
| **Marquer comme lu** | ✅ DDETS et DREETS | Vérification du territoire |
| **EIG par déclaration** | ✅ Via `/eig/admin/ds/:declarationId` | `boCheckRoleDS` + `checkPermissionBODeclarationSejour` |
| **Notifications** | ✅ Réception automatique | Selon le territoire de l'agent |

## Règles spécifiques aux organismes OVA

### Attribution automatique des rôles EIG

Le système attribue automatiquement les rôles EIG selon le type d'organisme :

| Type d'organisme | Attribution automatique | Conditions |
|------------------|----------------------|------------|
| **Personne Physique** | ✅ `EIG_ECRITURE` | • Premier utilisateur de l'organisme<br>• Attribution lors de la création |
| **Personne Morale - Siège Social** | ✅ `EIG_ECRITURE` | • Premier utilisateur de l'organisme<br>• `siegeSocial = true` |
| **Personne Morale - Établissement Secondaire** | ❌ Pas d'attribution automatique | • `siegeSocial = false`<br>• `porteurAgrement = false` |

### Règles pour les établissements secondaires

Les établissements secondaires (non porteurs d'agrément) ont des règles spécifiques :

| Aspect | Règle | Implémentation |
|--------|-------|----------------|
| **Protocoles** | Héritage automatique | • `protocoleTransport` et `protocoleSanitaire` hérités de l'établissement principal |
| **Agrément** | Pas d'agrément propre | • `porteurAgrement = false`<br>• Référence à l'établissement principal |
| **Rôles EIG** | Attribution manuelle | • Pas d'attribution automatique<br>• Nécessite une attribution manuelle par un utilisateur `EIG_ECRITURE` |

### Contrôles d'accès par organisme

| Type d'utilisateur | Accès aux EIG | Contrôle |
|-------------------|----------------|----------|
| **Utilisateur organisme principal** | ✅ EIG de son organisme uniquement | `getIsUserAllowedOrganisme` |
| **Utilisateur établissement secondaire** | ✅ EIG de son établissement uniquement | Vérification via `user_organisme` |
| **Utilisateur sans organisme** | ❌ Accès bloqué | Redirection vers création d'organisme |

### Logique de vérification des organismes

```javascript
// Dans checkPermissionEIG.js
const isAllowedOrganisme = await Eig.getIsUserAllowedOrganisme(userId, eigId);
if (!isAllowedOrganisme) {
  throw new AppError("Vous n'êtes pas autorisé à accéder à cet EIG pour cet organisme");
}
```

### Héritage des protocoles

```javascript
// Dans post.js (création organisme)
if (type === "personne_morale" && !parametre.porteurAgrement) {
  await Organisme.update("protocole_transport", organismeAgree.protocoleTransport, organismeId);
  await Organisme.update("protocole_sanitaire", organismeAgree.protocoleSanitaire, organismeId);
}
```

* **Modification** : Uniquement possible si statut = `BROUILLON`
* **Suppression** : Uniquement possible si statut = `BROUILLON`
* **Dépôt** : Nécessite le rôle `EIG_ECRITURE`
