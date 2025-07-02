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

{% hint style="warning" %}
**Condition d'affichage**

Cette étape n'apparaît que pour les personnes morales qui sont le siège social.
{% endhint %}

<table><thead><tr><th width="237.98828125">Nom du champ</th><th width="95.9296875">Type</th><th width="103.90625">Obligatoire</th><th>Précision</th></tr></thead><tbody><tr><td>SIRET</td><td>Texte</td><td>N</td><td>Champ de recherche pour filtrer les établissements par numéro SIRET</td></tr><tr><td>Dénomination</td><td>Texte</td><td>N</td><td>Champ de recherche pour filtrer les établissements par nom</td></tr><tr><td>Commune</td><td>Texte</td><td>N</td><td>Champ de recherche pour filtrer les établissements par commune</td></tr><tr><td>Statut</td><td>Liste déroulante</td><td>N</td><td>Filtre par statut : Tous, En activité, Autorisés à organiser des séjours, Fermés</td></tr><tr><td>Liste des établissements</td><td>Tableau</td><td>N</td><td>Affichage des établissements avec colonnes : SIRET, Dénomination, Adresse, Code postal, Commune, Action</td></tr><tr><td>Action (Interrupteur)</td><td>Interrupteur</td><td>N</td><td>Activation/désactivation de l'autorisation à organiser des séjours pour chaque établissement</td></tr><tr><td>Rafraîchir la liste des établissements secondaires</td><td>Bouton</td><td>N</td><td>Récupération des dernières données depuis l'API INSEE</td></tr></tbody></table>

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

{% hint style="info" %}
Pour la documentation sur la récupération en API des établissement secondaires

[recuperation-automatique-des-etablissements-secondaires.md](recuperation-automatique-des-etablissements-secondaires.md "mention")
{% endhint %}

