# Étape 2 - Établissements secondaires

{% hint style="warning" %}
**Condition d'affichage**

Cette étape n'apparaît que pour les personnes morales qui sont le siège social.
{% endhint %}

<figure><img src="../../../../.gitbook/assets/Capture d’écran 2025-07-04 à 17.52.12.png" alt=""><figcaption><p>Fiche organisme - Liste des établissement secondaire</p></figcaption></figure>

### Gestion des établissements secondaires

L'utilisateur peut :

* **Rechercher des établissements** par SIRET, dénomination ou commune
* **Filtrer par statut** : Tous, En activité, Autorisés à organiser des séjours, Fermés
* **Consulter la liste** des établissements liés à l'organisme dans un tableau

#### Informations affichées dans le tableau

Pour chaque établissement :

* Numéro SIRET
* Dénomination
* Adresse
* Code postal
* Commune
* Bouton "Action" : Autorisation à organiser des séjours

Pour mettre à jour le tableau, un bouton est disponible pour récupérer des dernières données depuis l'API entreprise.

En cas d'indisponibilité de l'API Entreprise, un message d'erreur s'affiche

<details>

<summary>Capture : Erreur API entreprise</summary>

<figure><img src="../../../../.gitbook/assets/Capture d’écran 2025-07-11 à 15.21.35.png" alt=""><figcaption></figcaption></figure>

</details>

{% hint style="info" %}
**Info**

* Pour la documentation sur la récupération en API des établissement secondaires
  * [recuperation-automatique-des-etablissements-secondaires.md](recuperation-automatique-des-etablissements-secondaires.md "mention")
* Pour les règles métiers
  * [regles-metiers-etablissements.md](regles-metiers-etablissements.md "mention")
{% endhint %}

### Validation par établissement secondaire

Depuis la version v1.22.0, les établissements secondaires peuvent valider et organiser des séjours de manière autonome :

* **Autonomie** : Chaque établissement secondaire peut gérer ses propres séjours
* **Délégation** : L'établissement principal peut déléguer la gestion des séjours aux établissements secondaires
* **Validation** : Les établissements secondaires peuvent valider les déclarations de séjour pour leurs propres activités
* **Hébergements** : Chaque établissement secondaire peut avoir ses propres hébergements associés

### Gestion des permissions

* Les utilisateurs des établissements secondaires peuvent avoir des droits spécifiques
* La gestion des rôles est décentralisée par établissement
* Les permissions sont gérées individuellement pour chaque établissement secondaire
