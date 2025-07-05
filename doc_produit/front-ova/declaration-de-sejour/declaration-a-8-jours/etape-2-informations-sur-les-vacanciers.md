# Étape 2 - Informations sur les vacanciers (Déclaration à 8 jours)

Lors de la création d'une déclaration de séjour à 8 jours, l'utilisateur accède à l'étape 2 du formulaire : les informations définitives sur les vacanciers.

[Capture]

En accédant à cette étape, l'utilisateur doit confirmer ou mettre à jour les informations suivantes :

<details>
<summary>Formulaire déclaration de séjour à 8 jours – étape 2</summary>

<table><thead><tr><th width="237.98828125">Nom du champ</th><th width="95.9296875">Type</th><th width="103.90625">Obligatoire</th><th>Précision</th></tr></thead><tbody><tr><td>Effectif des vacanciers</td><td>Nombre</td><td>O</td><td>Nombre définitif total de vacanciers pour le séjour</td></tr><tr><td>Effectif des vacanciers - Femmes</td><td>Nombre</td><td>O</td><td>Nombre définitif de femmes pour le séjour</td></tr><tr><td>Effectif des vacanciers - Hommes</td><td>Nombre</td><td>O</td><td>Nombre définitif d'hommes pour le séjour</td></tr><tr><td>Tranches d'âge</td><td>Cases à cocher</td><td>O</td><td>Choix multiples : 18-39 ans, 40-59 ans, Plus de 59 ans</td></tr><tr><td>Types de déficiences</td><td>Cases à cocher</td><td>O</td><td>Choix multiples : Auditif, Mental/Psychique, Moteur, Polyhandicap, Visuel</td></tr><tr><td>Précisions sur les déficiences</td><td>Zone de texte</td><td>O</td><td>Précisions obligatoires sur les types de déficiences sélectionnés</td></tr></tbody></table>

</details>

## Champs pré-remplis

Les effectifs prévisionnels de la déclaration à 2 mois sont pré-remplis et doivent être confirmés ou mis à jour avec les effectifs définitifs.

## Fonctionnalités principales

- Confirmation ou mise à jour des effectifs définitifs par genre (hommes, femmes)
- Calcul automatique de l'effectif total définitif
- Confirmation des tranches d'âge et types de déficiences
- Mise à jour des précisions sur les déficiences

[Capture]

## Les autres informations affichées à cette étape

- Affichage des effectifs prévisionnels de la déclaration à 2 mois en référence
- Calcul automatique de l'effectif total définitif (hommes + femmes)
- Validation que les effectifs définitifs sont cohérents
- Messages d'erreur si les effectifs ne correspondent pas aux exigences

[Capture]

## Règles métier

* Les effectifs définitifs (hommes et femmes) doivent être renseignés et confirmés.
* L'effectif total définitif est calculé automatiquement (hommes + femmes).
* Au moins une tranche d'âge doit être sélectionnée.
* Au moins un type de déficience doit être sélectionné.
* Les précisions sur les déficiences sont obligatoires.
* Les effectifs définitifs peuvent différer des effectifs prévisionnels de la déclaration à 2 mois.

## Actions possibles

* **Confirmer** les effectifs de la déclaration à 2 mois
* **Modifier** les effectifs si nécessaire
* **Sauvegarder** la déclaration à tout moment (brouillon)
* **Passer à l'étape suivante** si tous les champs sont valides

## Statut associé

* **ATTENTE_8_JOUR** : La déclaration à 2 mois a été validée, en attente de la déclaration à 8 jours. 