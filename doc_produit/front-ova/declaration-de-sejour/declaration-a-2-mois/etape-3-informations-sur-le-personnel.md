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

En accédant à cette étape, l'utilisateur doit renseigner les informations suivantes :

<details>

<summary>Formulaire déclaration de séjour – étape 3</summary>

{% include "../../.gitbook/includes/formulaire-declaration-de-sejour-etape-3.md" %}

</details>



## Fonctionnalités principales

* Saisie des effectifs prévisionnels (accompagnants et responsables)
* Indication de la procédure de recrutement supplémentaire
* À 8 jours : saisie détaillée des accompagnants et encadrants avec attestations
* À 8 jours : description de la formation en amont
* À 8 jours : gestion des prestataires extérieurs

\[Capture]

## Les autres informations affichées à cette étape

* Validation automatique des effectifs minimum selon le statut
* Affichage des informations en lecture seule pour les déclarations à 2 mois
* Gestion des attestations obligatoires pour le personnel à 8 jours
* Messages d'erreur si les effectifs ne correspondent pas aux exigences

\[Capture]

## Règles métier

* Les effectifs prévisionnels (accompagnants et responsables) doivent être renseignés.
* La procédure de recrutement supplémentaire est obligatoire.
* À 8 jours : au moins 1 accompagnant et 1 responsable d'encadrement sont obligatoires.
* À 8 jours : tous les accompagnants et encadrants doivent avoir une attestation cochée.
* À 8 jours : la description de la formation est obligatoire.
* Les prestataires extérieurs sont optionnels mais doivent être détaillés si présents.

## Actions possibles

* **Saisir** les effectifs prévisionnels (accompagnants et responsables)
* **Indiquer** la procédure de recrutement supplémentaire
* **À 8 jours** : ajouter les détails des accompagnants et encadrants
* **À 8 jours** : décrire la formation en amont
* **À 8 jours** : gérer les prestataires extérieurs
* **Sauvegarder** la déclaration à tout moment (brouillon)
* **Passer à l'étape suivante** si tous les champs sont valides

## Statut associé

* **BROUILLON** : La déclaration est en cours de saisie, non transmise.
