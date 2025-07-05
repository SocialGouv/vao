# Étape 1 - Informations générales (Déclaration à 8 jours)

Lors de la création d'une déclaration de séjour à 8 jours, l'utilisateur accède à l'étape 1 du formulaire : les informations générales définitives.

[Capture]

En accédant à cette étape, l'utilisateur doit confirmer ou mettre à jour les informations suivantes :

<details>
<summary>Formulaire déclaration de séjour à 8 jours – étape 1</summary>

<table><thead><tr><th width="237.98828125">Nom du champ</th><th width="95.9296875">Type</th><th width="103.90625">Obligatoire</th><th>Précision</th></tr></thead><tbody><tr><td>Titre</td><td>Texte</td><td>O</td><td>Nom définitif de votre demande de séjour (max 50 caractères)</td></tr><tr><td>Date de début</td><td>Date</td><td>O</td><td>Date définitive du premier jour du séjour</td></tr><tr><td>Date de fin</td><td>Date</td><td>O</td><td>Date définitive de fin du séjour</td></tr><tr><td>Période</td><td>Texte</td><td>N</td><td>Calculée automatiquement selon la date de début (hiver, printemps, été, automne)</td></tr><tr><td>Durée du séjour</td><td>Nombre</td><td>N</td><td>Calculée automatiquement en jours</td></tr><tr><td>Responsable du séjour</td><td>Personne</td><td>O</td><td>Responsable définitif du séjour avec coordonnées complètes</td></tr></tbody></table>

</details>

## Champs pré-remplis

Les informations de la déclaration à 2 mois sont pré-remplies et peuvent être modifiées si nécessaire.

## Fonctionnalités principales

- Confirmation ou modification des informations générales définitives
- Validation des dates définitives du séjour
- Mise à jour des informations du responsable du séjour
- Calcul automatique de la durée et de la période

[Capture]

## Les autres informations affichées à cette étape

- Affichage des informations de la déclaration à 2 mois en référence
- Validation que les dates définitives sont cohérentes
- Messages d'erreur si les modifications ne respectent pas les règles

[Capture]

## Règles métier

* Les dates définitives doivent être confirmées et ne peuvent pas être antérieures à la date actuelle.
* Le responsable du séjour doit être clairement identifié avec ses coordonnées.
* Les modifications par rapport à la déclaration à 2 mois doivent être justifiées.
* La durée du séjour est calculée automatiquement et ne peut pas être modifiée manuellement.

## Actions possibles

* **Confirmer** les informations de la déclaration à 2 mois
* **Modifier** les informations si nécessaire
* **Sauvegarder** la déclaration à tout moment (brouillon)
* **Passer à l'étape suivante** si tous les champs sont valides

## Statut associé

* **ATTENTE_8_JOUR** : La déclaration à 2 mois a été validée, en attente de la déclaration à 8 jours. 