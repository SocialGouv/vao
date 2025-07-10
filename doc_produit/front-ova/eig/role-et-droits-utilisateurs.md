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

| Rôle                 | Permissions             | Actions autorisées                                                                                                                                                                                                                                                               |
| -------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Lecture seule**    | Consultation uniquement | <p>• Consulter la liste des EIG<br>• Consulter un EIG détaillé<br>• Voir les statuts et types d'événements<br>• Accéder aux documents joints</p>                                                                                                                                 |
| **Lecture/Écriture** | Accès complet           | <p>• Toutes les permissions de lecture<br>• Créer un nouvel EIG<br>• Modifier un EIG en statut BROUILLON<br>• Supprimer un EIG en statut BROUILLON<br>• Déposer un EIG (passage ENVOYE)<br>• Gérer les documents joints<br>• Attribuer des rôles EIG aux autres utilisateurs</p> |

## Contrôles d'accès par fonctionnalité

| Fonctionnalité         | EIG\_LECTURE | EIG\_ECRITURE         |
| ---------------------- | ------------ | --------------------- |
| **Menu de navigation** | ✅ Affiché    | ✅ Affiché             |
| **Liste des EIG**      | ✅ Accès      | ✅ Accès               |
| **Consultation EIG**   | ✅ Accès      | ✅ Accès               |
| **Création EIG**       | ❌ Bloqué     | ✅ Accès               |
| **Modification EIG**   | ❌ Bloqué     | ✅ Si statut BROUILLON |
| **Suppression EIG**    | ❌ Bloqué     | ✅ Si statut BROUILLON |
| **Gestion des rôles**  | ❌ Bloqué     | ✅ Accès               |

### Utilisateurs OVA (Front)

| Rôle EIG           | Permissions     | Actions autorisées                                                                                                                                                                                                                                                                                |
| ------------------ | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Aucun rôle EIG** | ❌ Accès bloqué  | • Aucun accès aux fonctionnalités EIG                                                                                                                                                                                                                                                             |
| **EIG\_LECTURE**   | ✅ Lecture seule | <p>• Consulter la liste des EIG de son organisme<br>• Consulter un EIG détaillé<br>• Voir les statuts et types d'événements<br>• Accéder aux documents joints</p>                                                                                                                                 |
| **EIG\_ECRITURE**  | ✅ Accès complet | <p>• Toutes les permissions de lecture<br>• Créer un nouvel EIG<br>• Modifier un EIG en statut BROUILLON<br>• Supprimer un EIG en statut BROUILLON<br>• Déposer un EIG (passage ENVOYE)<br>• Gérer les documents joints<br>• Attribuer des rôles EIG aux autres utilisateurs de son organisme</p> |

### Agents (Back Office)

Les agents sont les utilisateurs du back office qui gèrent les EIG et ont des permissions étendues.

| Rôle Back Office          | Permissions EIG | Actions autorisées                                                                                                                                                                 |
| ------------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Agent avec rôle `eig`** | ✅ Accès complet | <p>• Consulter tous les EIG (tous organismes)<br>• Marquer un EIG comme lu (DDETS/DREETS)<br>• Accéder aux EIG par déclaration de séjour<br>• Voir les notifications et emails</p> |
| **Agent sans rôle `eig`** | ❌ Accès bloqué  | • Aucun accès aux fonctionnalités EIG                                                                                                                                              |

### Contrôles d'accès par organisme

| Type d'utilisateur                       | Accès aux EIG                                                                                                                    |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Utilisateur organisme principal**      | <p>Peut accéder </p><ul><li>aux EIG de son organisme</li><li>aux EIG des établissements secondaires liés au même SIREN</li></ul> |
| **Utilisateur établissement secondaire** | <p>Peut accéder </p><ul><li>aux EIG de son établissement (SIRET) si délégation effectuée par l'organisme principal</li></ul>     |

Pour donner accès aux EIG pour les utilisateurs des établissement secondaire, l'établissement principal peut donner les droits individuellement dans la page des comptes utilisateurs :&#x20;

<figure><img src="../../.gitbook/assets/Capture d’écran 2025-07-10 à 10.41.13.png" alt=""><figcaption></figcaption></figure>
