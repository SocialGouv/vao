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

# Étape 3 - Informations sur le personnel

Lors de la création d'une déclaration de séjour à 2 mois, l'utilisateur accède à l'étape 3 du formulaire : les informations prévisionnelles sur le personnel.

[Capture]

En accédant à cette étape, l'utilisateur doit renseigner les informations suivantes :

<details>

<summary>Formulaire déclaration de séjour à 2 mois – étape 3</summary>

{% include "../../.gitbook/includes/formulaire-declaration-de-sejour-etape-3.md" %}

</details>

## Fonctionnalités principales

- Saisie des effectifs prévisionnels (accompagnants et responsables)
- Indication de la procédure de recrutement supplémentaire
- Validation automatique des effectifs minimum
- Calcul automatique du ratio d'encadrement

[Capture]

## Les autres informations affichées à cette étape

- Validation automatique des effectifs minimum (au moins 1 accompagnant et 1 responsable)
- Messages d'erreur si les effectifs ne correspondent pas aux exigences
- Indicateurs de progression du formulaire
- Possibilité de sauvegarder en brouillon

[Capture]

## Règles métier

* Les effectifs prévisionnels (accompagnants et responsables) doivent être renseignés.
* Au moins 1 accompagnant et 1 responsable d'encadrement sont obligatoires.
* La procédure de recrutement supplémentaire est obligatoire.
* Les effectifs prévisionnels peuvent être ajustés jusqu'à la transmission.
* Le ratio d'encadrement est calculé automatiquement selon les effectifs.

## Actions possibles

* **Saisir** les effectifs prévisionnels (accompagnants et responsables)
* **Indiquer** la procédure de recrutement supplémentaire
* **Sauvegarder** la déclaration à tout moment (brouillon)
* **Passer à l'étape suivante** si tous les champs sont valides
* **Revenir aux étapes précédentes** pour modifier les informations

## Statut associé

* **BROUILLON** : La déclaration est en cours de saisie, non transmise.
