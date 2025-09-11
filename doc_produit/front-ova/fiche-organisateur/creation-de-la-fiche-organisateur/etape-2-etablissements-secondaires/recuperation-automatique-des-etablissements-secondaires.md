# Récupération automatique des établissements secondaires

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
**Note technique**\
La récupération utilise l'API INSEE SIRENE qui fournit les données officielles des établissements français. Le système récupère jusqu'à 1000 établissements par page et peut traiter plusieurs pages si nécessaire.
{% endhint %}

Depuis la version v1.22.0, le système a été mis à jour pour utiliser les nouvelles URIs et méthodes d'authentification de l'API INSEE :

### Changements techniques

* **Nouvelles URIs** : Mise à jour des endpoints de l'API INSEE pour les environnements de production et de préproduction
* **Authentification** : Amélioration du système d'authentification avec l'API INSEE
* **Gestion des erreurs** : Amélioration de la gestion des erreurs et des timeouts
* **Performance** : Optimisation des appels API pour une meilleure réactivité

### Impact utilisateur

* **Transparence** : Les utilisateurs ne perçoivent aucun changement dans l'interface
* **Fiabilité** : Amélioration de la stabilité de la récupération des établissements
* **Rapidité** : Temps de réponse optimisés pour la récupération des données

### Gestion des indisponibilités

* **Détection automatique** : Le système détecte automatiquement les indisponibilités de l'API INSEE
* **Messages d'erreur** : Affichage de messages clairs en cas d'indisponibilité
* **Retry automatique** : Tentatives automatiques de reconnexion en cas d'échec temporaire

### Gestion des autorisations

Chaque établissement secondaire peut être **activé ou désactivé** par le siège social :

* **Activé** : L'établissement peut organiser des séjours VAO
* **Désactivé** : L'établissement ne peut pas organiser de séjours VAO

{% hint style="warning" %}
**Important**\
Seuls les établissements en activité (état administratif "En activité") peuvent être activés pour organiser des séjours.
{% endhint %}

### Filtres disponibles

L'utilisateur peut filtrer les établissements selon plusieurs critères :

* **SIRET** : Recherche par numéro SIRET
* **Dénomination** : Recherche par nom de l'établissement
* **Commune** : Recherche par ville
* **Statut** :
  * Tous
  * En activité
  * Autorisés à organiser des séjours
  * Fermés

### Affichage des statistiques

En haut de la liste, des statistiques sont affichées :

* Nombre total d'établissements secondaires
* Nombre d'établissements autorisés à organiser des séjours
* Nombre d'établissements activés

***

### Cas particuliers

**Aucun établissement secondaire**

Si l'organisme n'a pas d'établissements secondaires, l'étape affiche un message indiquant qu'aucun établissement secondaire n'est rattaché au SIRET renseigné.

<details>

<summary>Capture - aucun d'établissement secondaire</summary>

<figure><img src="../../../../.gitbook/assets/Capture d’écran 2025-06-29 à 14.51.28.png" alt=""><figcaption></figcaption></figure>

</details>

**Erreur de récupération**

En cas d'erreur lors de la récupération des données depuis l'API INSEE, un message d'erreur s'affiche et l'utilisateur peut réessayer en utilisant le bouton de rafraîchissement.

{% hint style="info" %}
**Sauvegarde**\
Les modifications des autorisations d'établissements sont sauvegardées automatiquement lors du passage à l'étape suivante.
{% endhint %}
