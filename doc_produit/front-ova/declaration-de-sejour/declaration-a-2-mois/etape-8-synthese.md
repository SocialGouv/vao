# Étape 8 - Synthèse

Lors de la création d'une déclaration de séjour à 2 mois, l'utilisateur accède à l'étape 8 du formulaire : la synthèse et l'attestation sur l'honneur.

[Capture]

En accédant à cette étape, l'utilisateur peut consulter un récapitulatif complet de sa déclaration et doit signer l'attestation sur l'honneur pour finaliser le dépôt.

## Fonctionnalités principales

- Affichage du récapitulatif complet de la déclaration
- Formulaire d'attestation sur l'honneur
- Validation finale avant dépôt
- Génération automatique du numéro de déclaration
- Transmission de la déclaration aux services instructeurs

[Capture]

## Les autres informations affichées à cette étape

- Récapitulatif de toutes les informations saisies aux étapes précédentes
- Formulaire d'attestation avec signature électronique
- Numéro de déclaration généré automatiquement
- Statut de la déclaration après dépôt
- Messages de confirmation et d'accusé de réception

[Capture]

## Règles métier

* L'attestation sur l'honneur est obligatoire pour finaliser le dépôt.
* Tous les champs de l'attestation doivent être renseignés.
* La date de l'attestation doit être la date du jour.
* Le numéro de déclaration est généré automatiquement au format : DS-YY-DEPARTEMENT-NNNN.
* Après dépôt, la déclaration passe en statut "EN COURS".
* Un accusé de réception est envoyé par email à l'organisateur.

## Actions possibles

* **Consulter** le récapitulatif complet de la déclaration
* **Renseigner** l'attestation sur l'honneur (nom, prénom, qualité, date)
* **Cocher** la case de certification des informations
* **Signer** électroniquement l'attestation
* **Déposer** la déclaration pour transmission aux services instructeurs
* **Revenir aux étapes précédentes** pour modifier les informations
* **Annuler** le dépôt et revenir au statut brouillon

## Formulaire d'attestation

<details>
<summary>Formulaire attestation sur l'honneur</summary>

<table><thead><tr><th width="237.98828125">Nom du champ</th><th width="95.9296875">Type</th><th width="103.90625">Obligatoire</th><th>Précision</th></tr></thead><tbody><tr><td>Certification des informations</td><td>Case à cocher</td><td>O</td><td>L'utilisateur doit cocher cette case pour certifier que les informations sont exactes</td></tr><tr><td>Nom du signataire</td><td>Zone de texte</td><td>O</td><td>Nom de la personne qui signe l'attestation. Minimum 1 caractère.</td></tr><tr><td>Prénom du signataire</td><td>Zone de texte</td><td>O</td><td>Prénom de la personne qui signe l'attestation. Minimum 1 caractère.</td></tr><tr><td>Qualité du signataire</td><td>Zone de texte</td><td>O</td><td>Fonction ou qualité de la personne qui signe l'attestation. Minimum 1 caractère.</td></tr><tr><td>Date de l'attestation</td><td>Date</td><td>O</td><td>Date de signature de l'attestation. Doit être la date du jour.</td></tr></tbody></table>

</details>

## Statut associé

* **BROUILLON** : La déclaration est en cours de saisie, non transmise.
* **EN COURS** : La déclaration a été déposée et est en cours d'instruction.
* **TRANSMISE** : La déclaration a été transmise aux services instructeurs. 