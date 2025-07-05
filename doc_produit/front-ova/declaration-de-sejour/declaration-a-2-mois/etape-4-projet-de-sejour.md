# Étape 4 - Projet de séjour

Lors de la création d'une déclaration de séjour à 2 mois, l'utilisateur accède à l'étape 4 du formulaire : le projet de séjour.

[Capture]

En accédant à cette étape, l'utilisateur doit renseigner les informations suivantes :

<details>
<summary>Formulaire déclaration de séjour à 2 mois – étape 4</summary>

<table><thead><tr><th width="237.98828125">Nom du champ</th><th width="95.9296875">Type</th><th width="103.90625">Obligatoire</th><th>Précision</th></tr></thead><tbody><tr><td>Activités de bien-être</td><td>Liste à choix multiples</td><td>O</td><td>Sélection des activités de bien-être prévues pendant le séjour</td></tr><tr><td>Activités culturelles</td><td>Liste à choix multiples</td><td>O</td><td>Sélection des activités culturelles prévues pendant le séjour</td></tr><tr><td>Activités sportives</td><td>Liste à choix multiples</td><td>O</td><td>Sélection des activités sportives prévues pendant le séjour</td></tr><tr><td>Destination</td><td>Liste à choix multiples</td><td>O</td><td>Sélection des destinations prévues pour le séjour</td></tr><tr><td>Activités du personnel prévu</td><td>Zone de texte</td><td>N</td><td>Description des activités spécifiques prévues pour le personnel</td></tr></tbody></table>

</details>

## Fonctionnalités principales

- Sélection des activités de bien-être prévues
- Sélection des activités culturelles prévues
- Sélection des activités sportives prévues
- Sélection des destinations prévues
- Description optionnelle des activités du personnel

[Capture]

## Les autres informations affichées à cette étape

- Validation automatique des sélections obligatoires
- Messages d'erreur si les champs obligatoires ne sont pas renseignés
- Indicateurs de progression du formulaire
- Possibilité de sauvegarder en brouillon

[Capture]

## Règles métier

* Au moins une activité de bien-être doit être sélectionnée.
* Au moins une activité culturelle doit être sélectionnée.
* Au moins une activité sportive doit être sélectionnée.
* Au moins une destination doit être sélectionnée.
* La description des activités du personnel est optionnelle.
* Les sélections peuvent être modifiées jusqu'à la transmission.

## Actions possibles

* **Sélectionner** les activités de bien-être prévues
* **Sélectionner** les activités culturelles prévues
* **Sélectionner** les activités sportives prévues
* **Sélectionner** les destinations prévues
* **Décrire** les activités du personnel (optionnel)
* **Sauvegarder** la déclaration à tout moment (brouillon)
* **Passer à l'étape suivante** si tous les champs sont valides
* **Revenir aux étapes précédentes** pour modifier les informations

## Statut associé

* **BROUILLON** : La déclaration est en cours de saisie, non transmise. 