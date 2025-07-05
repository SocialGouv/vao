# Étape 5 - Informations sur le transport

Lors de la création d'une déclaration de séjour à 2 mois, l'utilisateur accède à l'étape 5 du formulaire : les informations sur le transport.

[Capture]

En accédant à cette étape, l'utilisateur doit renseigner les informations suivantes :

<details>
<summary>Formulaire déclaration de séjour à 2 mois – étape 5</summary>

<table><thead><tr><th width="237.98828125">Nom du champ</th><th width="95.9296875">Type</th><th width="103.90625">Obligatoire</th><th>Précision</th></tr></thead><tbody><tr><td>Responsable du transport jusqu'au lieu de séjour</td><td>Liste à choix multiples</td><td>O</td><td>Sélection du responsable du transport. Options disponibles : "Les vacanciers viennent par leurs propres moyens", "Le transport vers le lieu de séjour est assuré par l'organisateur". Au moins une option doit être sélectionnée.</td></tr><tr><td>Modes de transport utilisés</td><td>Liste à choix multiples</td><td>C</td><td>Sélection des modes de transport. Options disponibles : Avion, Train, Autobus/car, Automobile, Bateau, Autre. Obligatoire si l'organisateur assure le transport.</td></tr><tr><td>Mode d'organisation retenu</td><td>Zone de texte</td><td>C</td><td>Description du mode d'organisation (conditions d'accompagnement, gestion des correspondances, lieux de prise en charge, temps d'attente, etc.). Obligatoire si l'organisateur assure le transport. Minimum 5 caractères.</td></tr><tr><td>Déplacements durant le séjour</td><td>Case à cocher</td><td>O</td><td>Indication si des déplacements sont prévus durant le séjour (Oui/Non)</td></tr><tr><td>Véhicules adaptés</td><td>Case à cocher</td><td>C</td><td>Indication si les véhicules utilisés sont adaptés. Obligatoire si déplacements durant le séjour OU si mode de transport inclut "Autobus/car" ou "Automobile".</td></tr><tr><td>Spécificités des véhicules</td><td>Zone de texte</td><td>C</td><td>Description des spécificités des véhicules. Obligatoire si "Véhicules adaptés" = Oui. Minimum 5 caractères.</td></tr><tr><td>Documents relatifs à l'organisation des transports</td><td>Fichiers</td><td>N</td><td>Possibilité de joindre des documents relatifs à l'organisation des transports. Formats supportés : jpg, png, pdf. Taille maximale : 5 Mo.</td></tr></tbody></table>

</details>

## Fonctionnalités principales

- Pré-remplissage automatique avec les informations de la fiche organisme
- Sélection du responsable du transport (vacanciers ou organisateur)
- Gestion conditionnelle des champs selon le responsable sélectionné
- Validation automatique des champs obligatoires selon les conditions
- Possibilité de joindre des documents

[Capture]

## Les autres informations affichées à cette étape

- Affichage des informations pré-remplies de la fiche organisme
- Validation automatique des champs conditionnels
- Messages d'erreur si les champs obligatoires ne sont pas renseignés
- Indicateurs de progression du formulaire
- Possibilité de sauvegarder en brouillon

[Capture]

## Règles métier

* Le responsable du transport est obligatoire (vacanciers ou organisateur).
* Si l'organisateur assure le transport, les modes de transport et le mode d'organisation deviennent obligatoires.
* Les déplacements durant le séjour sont obligatoires (Oui/Non).
* Les véhicules adaptés sont obligatoires si déplacements OU si mode de transport inclut "Autobus/car" ou "Automobile".
* Les spécificités des véhicules sont obligatoires si "Véhicules adaptés" = Oui.
* Les documents sont optionnels mais limités en taille et format.

## Actions possibles

* **Confirmer** les informations pré-remplies de la fiche organisme
* **Modifier** les informations si nécessaire
* **Sélectionner** le responsable du transport
* **Renseigner** les modes de transport (si organisateur)
* **Décrire** le mode d'organisation (si organisateur)
* **Indiquer** les déplacements durant le séjour
* **Préciser** les véhicules adaptés et leurs spécificités
* **Joindre** des documents (optionnel)
* **Sauvegarder** la déclaration à tout moment (brouillon)
* **Passer à l'étape suivante** si tous les champs sont valides
* **Revenir aux étapes précédentes** pour modifier les informations

## Statut associé

* **BROUILLON** : La déclaration est en cours de saisie, non transmise. 