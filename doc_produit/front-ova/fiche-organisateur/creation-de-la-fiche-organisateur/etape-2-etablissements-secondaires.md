---
layout:
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

# Étape 2 - Établissements secondaires

{% hint style="warning" %}
**Condition d'affichage**

Cette étape n'apparaît que pour les personnes morales qui sont le siège social.
{% endhint %}

## Gestion des établissements secondaires

L'utilisateur peut :

* **Rechercher des établissements** par SIRET, dénomination ou commune
* **Filtrer par statut** : Tous, En activité, Autorisés à organiser des séjours, Fermés
* **Consulter la liste** des établissements liés à l'organisme

[CAPTURE - Page établissements secondaires]

### Informations affichées

Pour chaque établissement :

* Numéro SIRET
* Dénomination
* Commune
* Statut (En activité, Fermé, etc.)
* Autorisation à organiser des séjours

## Récupération automatique des établissements

### Source des données

Les établissements secondaires sont récupérés automatiquement depuis l'**API INSEE** (Institut National de la Statistique et des Études Économiques) en utilisant le **SIREN** de l'organisme.

### Processus de récupération

1. **Déclenchement** : La récupération se déclenche automatiquement lors de l'accès à l'étape 2
2. **Appel API INSEE** : Le système interroge l'API INSEE avec le SIREN de l'organisme
3. **Filtrage** : Seuls les établissements actifs (état administratif "A") et différents du siège social sont retenus
4. **Formatage** : Les données sont formatées pour l'affichage dans l'interface

### Fonctionnalités de rafraîchissement

L'utilisateur peut rafraîchir manuellement la liste des établissements secondaires en cliquant sur le bouton **"Rafraîchir la liste des établissements secondaires"**.

{% hint style="info" %}
**Note technique**  
La récupération utilise l'API INSEE SIRENE qui fournit les données officielles des établissements français. Le système récupère jusqu'à 1000 établissements par page et peut traiter plusieurs pages si nécessaire.
{% endhint %}

### Gestion des autorisations

Chaque établissement secondaire peut être **activé ou désactivé** par le siège social :

* **Activé** : L'établissement peut organiser des séjours VAO
* **Désactivé** : L'établissement ne peut pas organiser de séjours VAO

{% hint style="warning" %}
**Important**  
Seuls les établissements en activité (état administratif "En activité") peuvent être activés pour organiser des séjours.
{% endhint %}

### Filtres disponibles

L'utilisateur peut filtrer les établissements selon plusieurs critères :

* **SIRET** : Recherche par numéro SIRET
* **Dénomination** : Recherche par nom de l'établissement
* **Commune** : Recherche par ville
* **Statut** : 
  - Tous
  - En activité
  - Autorisés à organiser des séjours
  - Fermés

### Affichage des statistiques

En haut de la liste, des statistiques sont affichées :
* Nombre total d'établissements secondaires
* Nombre d'établissements autorisés à organiser des séjours
* Nombre d'établissements activés

***

Dans le cas où il n'y a pas d'établissement secondaire, cette étape ne remonte rien.

<details>

<summary>Capture - aucun d'établissement secondaire</summary>

<figure><img src="../../../.gitbook/assets/Capture d'écran 2025-06-29 à 14.51.28.png" alt=""><figcaption><p>Aucun établissement secondaire rattaché au SIRET renseigné</p></figcaption></figure>

</details>

### Cas particuliers

#### Aucun établissement secondaire

Si l'organisme n'a pas d'établissements secondaires, l'étape affiche un message indiquant qu'aucun établissement secondaire n'est rattaché au SIRET renseigné.

#### Erreur de récupération

En cas d'erreur lors de la récupération des données depuis l'API INSEE, un message d'erreur s'affiche et l'utilisateur peut réessayer en utilisant le bouton de rafraîchissement.

{% hint style="info" %}
**Sauvegarde**  
Les modifications des autorisations d'établissements sont sauvegardées automatiquement lors du passage à l'étape suivante.
{% endhint %}
