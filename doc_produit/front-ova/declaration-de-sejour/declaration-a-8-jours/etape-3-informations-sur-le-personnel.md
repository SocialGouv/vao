# Étape 3 - Informations sur le personnel (Déclaration à 8 jours)

Lors de la création d'une déclaration de séjour à 8 jours, l'utilisateur accède à l'étape 3 du formulaire : les informations définitives sur le personnel.

[Capture]

En accédant à cette étape, l'utilisateur doit confirmer ou mettre à jour les informations suivantes :

<details>
<summary>Formulaire déclaration de séjour à 8 jours – étape 3</summary>

<table><thead><tr><th width="237.98828125">Nom du champ</th><th width="95.9296875">Type</th><th width="103.90625">Obligatoire</th><th>Précision</th></tr></thead><tbody><tr><td>Nombre d'accompagnants</td><td>Nombre</td><td>O</td><td>Nombre définitif d'accompagnants pour le séjour</td></tr><tr><td>Nombre de responsables</td><td>Nombre</td><td>O</td><td>Nombre définitif de responsables d'encadrement pour le séjour</td></tr><tr><td>Procédure de recrutement supplémentaire</td><td>Case à cocher</td><td>O</td><td>Prévoit-on un recrutement supplémentaire durant le séjour ?</td></tr><tr><td colspan="4"><strong>Informations détaillées (obligatoires à 8 jours)</strong></td></tr><tr><td>Accompagnants</td><td>Liste de personnes</td><td>O</td><td>Détails des accompagnants avec attestations obligatoires</td></tr><tr><td>Encadrants</td><td>Liste de personnes</td><td>O</td><td>Détails des encadrants avec attestations obligatoires</td></tr><tr><td>Formation</td><td>Zone de texte</td><td>O</td><td>Organisation, contenu et durée de la formation en amont</td></tr><tr><td>Prestataires médicaments</td><td>Liste de prestataires</td><td>N</td><td>Prestataires extérieurs en charge des médicaments</td></tr><tr><td>Prestataires transport</td><td>Liste de prestataires</td><td>N</td><td>Prestataires extérieurs en charge du transport</td></tr><tr><td>Prestataires restauration</td><td>Liste de prestataires</td><td>N</td><td>Prestataires extérieurs en charge de la restauration</td></tr><tr><td>Prestataires activités</td><td>Liste de prestataires</td><td>N</td><td>Prestataires extérieurs en charge d'activités spécifiques</td></tr><tr><td>Prestataires entretien</td><td>Liste de prestataires</td><td>N</td><td>Prestataires extérieurs en charge de l'entretien</td></tr></tbody></table>

</details>

## Champs pré-remplis

Les effectifs prévisionnels de la déclaration à 2 mois sont pré-remplis et doivent être confirmés ou mis à jour avec les effectifs définitifs.

## Fonctionnalités principales

- Confirmation ou mise à jour des effectifs définitifs (accompagnants et responsables)
- Saisie détaillée des accompagnants et encadrants avec attestations obligatoires
- Description de la formation en amont du séjour
- Gestion des prestataires extérieurs

[Capture]

## Les autres informations affichées à cette étape

- Affichage des effectifs prévisionnels de la déclaration à 2 mois en référence
- Validation automatique des effectifs minimum (au moins 1 accompagnant et 1 responsable)
- Gestion des attestations obligatoires pour le personnel
- Messages d'erreur si les effectifs ne correspondent pas aux exigences

[Capture]

## Règles métier

* Les effectifs définitifs (accompagnants et responsables) doivent être renseignés et confirmés.
* Au moins 1 accompagnant et 1 responsable d'encadrement sont obligatoires.
* Tous les accompagnants et encadrants doivent avoir une attestation cochée.
* La description de la formation en amont est obligatoire.
* Les prestataires extérieurs sont optionnels mais doivent être détaillés si présents.
* Les effectifs définitifs peuvent différer des effectifs prévisionnels de la déclaration à 2 mois.

## Actions possibles

* **Confirmer** les effectifs de la déclaration à 2 mois
* **Modifier** les effectifs si nécessaire
* **Ajouter** les détails des accompagnants et encadrants
* **Décrire** la formation en amont
* **Gérer** les prestataires extérieurs
* **Sauvegarder** la déclaration à tout moment (brouillon)
* **Passer à l'étape suivante** si tous les champs sont valides

## Statut associé

* **ATTENTE_8_JOUR** : La déclaration à 2 mois a été validée, en attente de la déclaration à 8 jours. 