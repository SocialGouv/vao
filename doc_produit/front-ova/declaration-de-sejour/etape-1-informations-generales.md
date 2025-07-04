# Étape 1 - Informations générales

Lors de la création d'une déclaration de séjour, l'utilisateur accède à un formulaire d'informations générales à compléter.

<details>

<summary>Capture</summary>

<figure><img src="../../../.gitbook/assets/a-chosen-soul-radulW4SHhA-unsplash.jpg" alt=""><figcaption></figcaption></figure>

</details>

En accédant à cette étape, l'utilisateur doit renseigner les informations suivantes :

<details>

<summary>Formulaire déclaration de séjour – étape 1</summary>



</details>

<details>

<summary>Capture</summary>

<figure><img src="../../../.gitbook/assets/PLACEHOLDER_CAPTURE_2.png" alt=""><figcaption></figcaption></figure>

</details>

## Champs pré-remplis

Certains champs sont automatiquement pré-remplis pour faciliter la saisie :

### **Dates pré-remplies :**

* **Date de début** : Pré-remplie à la date du jour + 2 mois (si pas de date existante)
* **Date de fin** : Pré-remplie à la date du jour + 2 mois + 7 jours (si pas de date existante)

### **Responsable de séjour pré-rempli :**

Le responsable est automatiquement pré-rempli selon le type d'organisme :

**Pour une personne morale :**

* Récupère les données du responsable de séjour de l'organisme

**Pour une personne physique :**

* **Nom** : Nom de naissance de la personne physique
* **Prénom** : Prénom de la personne physique
* **Fonction** : Pré-remplie avec "organisateur de séjour"
* **Email** : Email de l'utilisateur connecté
* **Téléphone** : Téléphone de la personne physique
* **Adresse** : Adresse du siège de la personne physique

### **Champs calculés automatiquement :**

* **Période** : Calculée selon la date de début (hiver, printemps, été, automne)
* **Durée du séjour** : Calculée automatiquement selon les dates de début et fin

### **Champs de l'organisme (si personne morale) :**

Tous les champs sont pré-remplis avec les données récupérées via l'API INSEE lors de la création de la fiche organisme.

## Règles métier

* Tous les champs obligatoires doivent être renseignés pour passer à l'étape suivante.
* La date de fin doit être postérieure à la date de début.
* Le responsable de séjour doit être une personne physique majeure.
* Les dates sont pré-remplies avec un délai de 2 mois par défaut (conformément à la réglementation).

## Actions possibles

* **Sauvegarder** la déclaration à tout moment (brouillon).
* **Passer à l'étape suivante** si tous les champs sont valides.

## Statut associé

* **BROUILLON** : La déclaration est en cours de saisie, non transmise.

## Mails envoyés

* Aucun mail n'est envoyé à cette étape.

***

Une fois cette étape complétée et validée, l'utilisateur accède à l'étape suivante du formulaire : **Informations sur les vacanciers**.
