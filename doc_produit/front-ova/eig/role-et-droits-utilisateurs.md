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

* **Modification** : Uniquement possible si statut = `BROUILLON`
* **Suppression** : Uniquement possible si statut = `BROUILLON`
* **Dépôt** : Nécessite le rôle `EIG_ECRITURE`
