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

# Étape 5 - Synthèse

L'utilisateur accède à l'étape 5 du formulaire : la synthèse de la déclaration à 8 jours et l'attestation sur l'honneur.



<figure><img src="../../../.gitbook/assets/Capture d’écran 2025-07-06 à 17.07.03.png" alt=""><figcaption><p>Déclaration à 8 jours - Étape 3 - Synthèse</p></figcaption></figure>

En accédant à cette étape, l'utilisateur peut consulter un récapitulatif complet de sa déclaration et doit signer l'attestation sur l'honneur pour finaliser le dépôt.

<details>

<summary>Formulaire "Attestation sur l'honneur"</summary>

{% include "../../../.gitbook/includes/formulaire-declaration-de-sejour-a-2-mois-etape-8.md" %}

</details>

## Règles métier

* L'attestation sur l'honneur est obligatoire pour finaliser le dépôt.
* Tous les champs de l'attestation doivent être renseignés.
* La date de l'attestation n'est pas éditable et affiche la date du jour
* La génération du CERFA de la déclaration en PDF ([disponible dans la page détaillée](../page-detaillee-declaration.md))
* Des logs sont ajouté dans [l'historique de la déclaration](../page-detaillee-declaration.md#id-3.-historique-de-la-declaration)
* Après dépôt, la déclaration passe en statut `Transmise 8J`.
* Un accusé de réception est envoyé par email à l'organisateur

{% include "../../../.gitbook/includes/validation-de-la-declaration-de-sejour-8-jours-confirmation.md" %}

* Un email est envoyé pour transmission de la déclaration aux services instructeurs

{% include "../../../.gitbook/includes/validation-de-la-declaration-de-sejour-8-jours.md" %}

Une fois la déclaration à 2 mois soumise, l'utilisateur est dirigé vers la page de liste des déclarations avec des alertes qui indique la bonne transmission au service départemental.&#x20;

<details>

<summary>Capture</summary>

<figure><img src="../../../.gitbook/assets/Capture d’écran 2025-07-07 à 10.43.38.png" alt=""><figcaption><p>Page de liste des déclarations de séjour</p></figcaption></figure>

</details>

