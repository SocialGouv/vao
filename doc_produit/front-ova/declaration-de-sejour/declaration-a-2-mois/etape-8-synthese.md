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

# Étape 8 - Synthèse

Lors de la création d'une déclaration de séjour à 2 mois, l'utilisateur accède à l'étape 8 du formulaire : la synthèse et l'attestation sur l'honneur.

<figure><img src="../../../.gitbook/assets/Capture d’écran 2025-07-05 à 17.10.04.png" alt=""><figcaption><p>Déclaration de séjour à 2 mois - Étape 8 - Synthèse</p></figcaption></figure>

En accédant à cette étape, l'utilisateur peut consulter un récapitulatif complet de sa déclaration et doit signer l'attestation sur l'honneur pour finaliser le dépôt.

<details>

<summary>Formulaire "Attestation sur l'honneur"</summary>

{% include "../../../.gitbook/includes/formulaire-declaration-de-sejour-a-2-mois-etape-8.md" %}

</details>

## Règles métier

* L'attestation sur l'honneur est obligatoire pour finaliser le dépôt.
* Tous les champs de l'attestation doivent être renseignés.
* La date de l'attestation doit être la date du jour.
* Le numéro de déclaration est généré automatiquement au format : DS-YY-DEPARTEMENT-NNNN.
* La génération du CERFA de la déclaration en PDF ([disponible dans la page détaillée](../page-detaillee-declaration.md))
* Après dépôt, la déclaration passe en statut "EN COURS".
* Un accusé de réception est envoyé par email à l'organisateur

{% include "../../../.gitbook/includes/validation-de-la-declaration-de-sejour-2-mois-confirmation.md" %}

* Un email est envoyé pour transmission de la déclaration aux services instructeurs

{% include "../../../.gitbook/includes/validation-de-la-declaration-de-sejour-2-mois.md" %}

Une fois la déclaration à 2 mois soumise, l'utilisateur est dirigé vers la page de liste des déclarations avec des alertes qui indique la bonne transmission au service départemental.&#x20;

<details>

<summary>Capture</summary>

<figure><img src="../../../.gitbook/assets/Capture d’écran 2025-07-05 à 18.21.49.png" alt=""><figcaption><p>Page de liste des déclarations de séjour</p></figcaption></figure>

</details>

## Actions possibles

* **Déposer** la déclaration pour transmission aux services instructeurs
* **Revenir aux étapes précédentes** pour modifier les informations
* **Annuler** le dépôt et revenir au statut brouillon

## Statut associé

* **BROUILLON** : La déclaration est en cours de saisie, non transmise.
* **TRANSMISE** : La déclaration a été transmise aux services instructeurs.
* **EN COURS** : La déclaration a été déposée et est en cours d'instruction.
