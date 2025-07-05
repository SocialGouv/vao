# Étape 7 - Sélection des hébergements

Lors de la création d'une déclaration de séjour à 2 mois, l'utilisateur accède à l'étape 7 du formulaire : la sélection des hébergements.

[Capture]

En accédant à cette étape, l'utilisateur doit sélectionner et configurer les hébergements qui seront utilisés pour le séjour. Il peut soit choisir parmi les hébergements existants de son organisme, soit créer un nouvel hébergement.

## Fonctionnalités principales

- Sélection parmi les hébergements existants de l'organisme (statut "actif")
- Création d'un nouvel hébergement si nécessaire
- Configuration des dates de début et fin pour chaque hébergement
- Gestion des informations de transport spécifiques à chaque hébergement
- Validation automatique de la continuité du séjour
- Possibilité de joindre des documents

[Capture]

## Les autres informations affichées à cette étape

- Liste des hébergements existants de l'organisme (nom, adresse, type)
- Formulaire de création d'hébergement (si nouveau)
- Configuration des dates pour chaque hébergement sélectionné
- Champs d'informations de transport pour chaque hébergement
- Messages d'erreur si les champs obligatoires ne sont pas renseignés
- Indicateurs de progression du formulaire
- Possibilité de sauvegarder en brouillon

[Capture]

## Règles métier

* Au moins un hébergement doit être sélectionné pour le séjour.
* Si le séjour est itinérant, au moins deux hébergements sont requis.
* Si le séjour n'est pas itinérant, un seul hébergement est autorisé.
* Les dates des hébergements doivent couvrir entièrement la période du séjour (de la date de début à la date de fin).
* Les hébergements doivent être sélectionnés dans l'ordre chronologique.
* Les informations de transport sont spécifiques à chaque hébergement.
* Les champs obligatoires varient selon le type d'hébergement et les activités prévues.
* Les documents sont optionnels mais limités en taille et format.

## Actions possibles

* **Sélectionner** un hébergement existant dans la liste
* **Créer** un nouvel hébergement si nécessaire
* **Configurer** les dates de début et fin pour chaque hébergement
* **Renseigner** les informations de transport spécifiques à l'hébergement
* **Modifier** les informations d'un hébergement existant
* **Supprimer** un hébergement de la sélection
* **Joindre** des documents (optionnel)
* **Sauvegarder** la déclaration à tout moment (brouillon)
* **Passer à l'étape suivante** si tous les champs sont valides
* **Revenir aux étapes précédentes** pour modifier les informations

## Formulaire d'hébergement

Pour plus de détails sur les champs du formulaire de création d'hébergement, consultez la page [Création d'un hébergement](../../../liste-des-hebergements/creation-dun-hebergement.md).

## Statut associé

* **BROUILLON** : La déclaration est en cours de saisie, non transmise. 