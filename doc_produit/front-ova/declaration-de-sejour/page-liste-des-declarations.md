# Page de liste des déclarations

La page de liste des déclarations permet à l'utilisateur de consulter et gérer l'ensemble de ses déclarations de séjour.

<figure><img src="../../.gitbook/assets/Capture d’écran 2025-07-06 à 14.39.30.png" alt=""><figcaption><p>Page de liste des déclarations de séjours</p></figcaption></figure>

## Fonctionnalités principales

### Affichage des déclarations

La page affiche un tableau avec les informations suivantes pour chaque déclaration :

* **N° enregistrement** : Numéro fonctionnel (ex: DS-24-75-0001)
* **Nom du séjour**
* **Département de suivi**
* **Etablissement déclarant**
* **Dates** : Date de début et de fin du séjour
* **Statut** : Statut actuel de la déclaration avec badge coloré
* **Actions** : Boutons d'actions disponibles
  * <i class="fa-greater-than">:greater-than:</i>  : permet d'accéder à la page détaillée de la déclaration
  * <i class="fa-x">:x:</i> : permet d'annuler une déclaration. Impossible de revenir dessus une fois annulée
  * <i class="fa-clone">:clone:</i> : permet de dupliquer une déclaration (si le statut l'autorise : `BROUILLON`, `TRANSMISE`, `EN_COURS`, `ANNULEE`, `ABANDONNEE`)

<div align="left"><figure><img src="../../.gitbook/assets/Capture d’écran 2025-07-06 à 14.43.02.png" alt="" width="166"><figcaption></figcaption></figure></div>

***

### Filtres de recherche

L'utilisateur peut filtrer les déclarations selon plusieurs critères :

* **N° enregistrement** : Numéro fonctionnel (ex: DS-24-75-0001)
* **Nom du séjour**
* **Établissement déclarant**
* **Département de d'inscrution**
* **Saison**
* **Statut**

***

### **Export CSV**

Il est possible de télécharger l'ensemble des déclarations de séjours du tableau en cliquant sur le bouton "Extraire en CSV".&#x20;

{% hint style="info" %}
**Amélioration v1.24.0**

L'export CSV inclut désormais le SIRET de l'organisme pour faciliter l'identification et le traitement des données.
{% endhint %}

### Filtres et tri

{% hint style="info" %}
**Amélioration v1.24.0**

Lors d'un changement de filtre, l'offset (position dans la liste) est automatiquement réinitialisé pour améliorer la navigation et éviter les problèmes d'affichage.
{% endhint %}
