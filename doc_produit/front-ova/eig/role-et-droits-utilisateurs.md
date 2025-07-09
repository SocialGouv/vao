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

## Vue d'ensemble

Le système de gestion des Événements Indésirables Graves (EIG) implémente un modèle de permissions basé sur deux rôles principaux :

- **EIG_LECTURE** : Accès en lecture seule
- **EIG_ECRITURE** : Accès complet (lecture + écriture)

## Tableau des rôles et permissions

| Rôle | Code Backend | Code Frontend | Permissions | Actions autorisées |
|------|-------------|---------------|-------------|-------------------|
| **Lecture seule** | `Eig_Lecture` | `EIG_LECTURE` | Consultation uniquement | • Consulter la liste des EIG<br>• Consulter un EIG détaillé<br>• Voir les statuts et types d'événements<br>• Accéder aux documents joints |
| **Lecture/Écriture** | `Eig_Ecriture` | `EIG_ECRITURE` | Accès complet | • Toutes les permissions de lecture<br>• Créer un nouvel EIG<br>• Modifier un EIG en statut BROUILLON<br>• Supprimer un EIG en statut BROUILLON<br>• Déposer un EIG (passage ENVOYE)<br>• Gérer les documents joints<br>• Attribuer des rôles EIG aux autres utilisateurs |

## Contrôles d'accès par fonctionnalité

### Frontend (Interface utilisateur)

| Fonctionnalité | EIG_LECTURE | EIG_ECRITURE | Contrôle |
|----------------|-------------|---------------|----------|
| **Menu de navigation** | ✅ Affiché | ✅ Affiché | Vérification des rôles dans `useMenuNavItem.js` |
| **Liste des EIG** | ✅ Accès | ✅ Accès | Middleware `check-roles.js` |
| **Consultation EIG** | ✅ Accès | ✅ Accès | Middleware `check-roles.js` |
| **Création EIG** | ❌ Bloqué | ✅ Accès | Vérification dans `useMenuNavItem.js` |
| **Modification EIG** | ❌ Bloqué | ✅ Si statut BROUILLON | `eigStore.canModify` |
| **Suppression EIG** | ❌ Bloqué | ✅ Si statut BROUILLON | `canDelete()` dans `utils/eig.js` |
| **Gestion des rôles** | ❌ Bloqué | ✅ Accès | `canUpdateRole` dans `Compte.vue` |

### Backend (API)

| Endpoint | Méthode | EIG_LECTURE | EIG_ECRITURE | Middleware |
|----------|---------|-------------|---------------|------------|
| `/eig/me` | GET | ✅ | ✅ | `checkPermissionEIG({ action: "READING" })` |
| `/eig` | POST | ❌ | ✅ | `checkPermissionEIG({ action: "CREATION" })` |
| `/eig/:id` | PUT | ❌ | ✅ | `checkPermissionEIG({ action: "MODIFICATION" })` |
| `/eig/:id` | DELETE | ❌ | ✅ | `checkPermissionEIG({ action: "DELETION" })` |
| `/eig/depose/:id` | POST | ❌ | ✅ | `checkPermissionEIG({ action: "MODIFICATION" })` |
| `/fo-user/roles/:userId` | POST | ❌ | ✅ | `checkPermissionFoRole({ role: "EIG_ECRITURE" })` |

## Logique de contrôle des permissions

### Backend (`checkPermissionEIG.js`)

```javascript
const ecriture = new Set([
  actions.creation,
  actions.modification, 
  actions.deletion,
  actions.reading,
]);

// Vérification des permissions
return (
  (ecriture.has(action) && droits.some(d => d.label === roles.EIG_ECRITURE)) ||
  (action === actions.reading && droits.some(d => d.label === roles.EIG_LECTURE))
);
```

### Frontend (`utils/eig.js`)

```javascript
const getEigPermissions = () => {
  const userStore = useUserStore();
  const allowEigReadWrite = userStore.user?.roles?.includes(userRolesRef.EIG_ECRITURE);
  const allowEigReadOnly = userStore.user?.roles?.includes(userRolesRef.EIG_LECTURE);
  return { allowEigReadWrite, allowEigReadOnly };
};
```

## Attribution automatique des rôles

### Création d'organisme

Lors de la création d'un organisme, le premier utilisateur reçoit automatiquement le rôle `EIG_ECRITURE` :

```javascript
// Dans post.js (création organisme)
if (type === "personne_physique" || parametre?.siegeSocial) {
  await updateRoles(userId, [roles.EIG_ECRITURE]);
}
```

### Utilisateurs Back Office

Tous les utilisateurs du back office reçoivent automatiquement le rôle `eig` :

```javascript
// Dans BoUser.js
if (!roles.includes("eig")) {
  await pool.query(...query.bindRole(id, "eig"));
}
```

## Contrôles supplémentaires

### Vérification d'organisme

Les utilisateurs ne peuvent accéder qu'aux EIG de leur organisme :

```javascript
// Vérification dans checkPermissionEIG.js
const isAllowedOrganisme = await Eig.getIsUserAllowedOrganisme(userId, eigId);
if (!isAllowedOrganisme) {
  throw new AppError("Vous n'êtes pas autorisé à accéder à cet EIG pour cet organisme");
}
```

### Contrôle des statuts

- **Modification** : Uniquement possible si statut = `BROUILLON`
- **Suppression** : Uniquement possible si statut = `BROUILLON`
- **Dépôt** : Nécessite le rôle `EIG_ECRITURE`

## Messages d'erreur

| Situation | Message d'erreur | Code HTTP |
|-----------|------------------|-----------|
| Aucun rôle EIG | "Vous n'êtes pas autorisé à accéder aux EIG" | 403 |
| Accès à un EIG d'un autre organisme | "Vous n'êtes pas autorisé à accéder à cet EIG pour cet organisme" | 403 |
| Tentative de modification sans droits | "Vous n'êtes pas autorisé modifier les droits" | 403 |

## Sécurité et traçabilité

- Toutes les actions sont tracées via le système de tracking
- Les permissions sont vérifiées à chaque requête
- Les contrôles sont appliqués côté frontend ET backend
- Les erreurs d'accès sont loggées pour audit
