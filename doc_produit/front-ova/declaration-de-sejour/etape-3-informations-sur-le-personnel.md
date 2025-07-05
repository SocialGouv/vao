# Étape 3 - Informations sur le personnel

Lors de la création d'une déclaration de séjour, l'utilisateur accède à l'étape 3 du formulaire : les informations sur le personnel.

[Capture]

En accédant à cette étape, l'utilisateur doit renseigner les informations suivantes :

<details>
<summary>Formulaire déclaration de séjour – étape 3</summary>

<table><thead><tr><th width="237.98828125">Nom du champ</th><th width="95.9296875">Type</th><th width="103.90625">Obligatoire</th><th>Précision</th></tr></thead><tbody><tr><td>Nombre d'accompagnants</td><td>Nombre</td><td>O</td><td>Nombre d'accompagnants prévus pour le séjour</td></tr><tr><td>Nombre de responsables</td><td>Nombre</td><td>O</td><td>Nombre de responsables d'encadrement prévus</td></tr><tr><td>Procédure de recrutement supplémentaire</td><td>Case à cocher</td><td>O</td><td>Prévoit-on un recrutement supplémentaire durant le séjour ?</td></tr><tr><td colspan="4"><strong>Informations détaillées (à 8 jours uniquement)</strong></td></tr><tr><td>Accompagnants</td><td>Liste de personnes</td><td>O (8j)</td><td>Détails des accompagnants avec attestations</td></tr><tr><td>Encadrants</td><td>Liste de personnes</td><td>O (8j)</td><td>Détails des encadrants avec attestations</td></tr><tr><td>Formation</td><td>Zone de texte</td><td>O (8j)</td><td>Organisation, contenu et durée de la formation</td></tr><tr><td>Prestataires médicaments</td><td>Liste de prestataires</td><td>N (8j)</td><td>Prestataires extérieurs en charge des médicaments</td></tr><tr><td>Prestataires transport</td><td>Liste de prestataires</td><td>N (8j)</td><td>Prestataires extérieurs en charge du transport</td></tr><tr><td>Prestataires restauration</td><td>Liste de prestataires</td><td>N (8j)</td><td>Prestataires extérieurs en charge de la restauration</td></tr><tr><td>Prestataires activités</td><td>Liste de prestataires</td><td>N (8j)</td><td>Prestataires extérieurs en charge d'activités spécifiques</td></tr><tr><td>Prestataires entretien</td><td>Liste de prestataires</td><td>N (8j)</td><td>Prestataires extérieurs en charge de l'entretien</td></tr></tbody></table>

</details>

## Champs pré-remplis

Certains champs peuvent être pré-remplis ou proposés automatiquement pour faciliter la saisie (ex : effectifs basés sur les séjours précédents, etc.).

## Fonctionnalités principales

- Saisie des effectifs prévisionnels (accompagnants et responsables)
- Indication de la procédure de recrutement supplémentaire
- À 8 jours : saisie détaillée des accompagnants et encadrants avec attestations
- À 8 jours : description de la formation en amont
- À 8 jours : gestion des prestataires extérieurs

[Capture]

## Les autres informations affichées à cette étape

- Validation automatique des effectifs minimum selon le statut
- Affichage des informations en lecture seule pour les déclarations à 2 mois
- Gestion des attestations obligatoires pour le personnel à 8 jours
- Messages d'erreur si les effectifs ne correspondent pas aux exigences

[Capture]

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