# Déclaration à 8 jours

La déclaration à 8 jours est la deuxième étape du processus de déclaration de séjour. Elle ne peut être effectuée que si la déclaration à 2 mois a été validée par les agents DDETS.

## Objectif

Confirmer les informations définitives du séjour 8 jours avant le début.

## Prérequis

- La déclaration à 2 mois doit être validée (statut `ATTENTE_8_JOUR`)
- Le séjour doit commencer dans les 8 jours

## Workflow

1. **Déclenchement** : Seulement si la déclaration à 2 mois est validée (statut `ATTENTE_8_JOUR`)
2. **Saisie** : Mise à jour des informations vacanciers et personnel avec données définitives
3. **Transmission** : L'organisateur transmet → statut `TRANSMISE_8J`
4. **Instruction** : Les agents prennent en charge → statut `EN_COURS_8J`
5. **Décision** : Les agents peuvent :
   - **Valider définitivement** → statut `VALIDEE_8J` (autorisation finale)
   - **Demander des compléments** → statut `A_MODIFIER_8J`
   - **Refuser** → statut `REFUSEE_8J`

## Étapes du formulaire

1. [Étape 1 - Informations générales](etape-1-informations-generales.md)
2. [Étape 2 - Informations sur les vacanciers](etape-2-informations-sur-les-vacanciers.md)
3. [Étape 3 - Informations sur le personnel](etape-3-informations-sur-le-personnel.md)
4. [Menu et étapes du formulaire](menu-etapes-formulaire.md)

## Statuts associés

- **ATTENTE_8_JOUR** : Déclaration à 2 mois validée, en attente de la déclaration à 8 jours
- **TRANSMISE_8J** : Déclaration à 8 jours transmise
- **EN_COURS_8J** : En instruction par les agents DDETS
- **A_MODIFIER_8J** : Compléments demandés par les agents
- **VALIDEE_8J** : Validée définitivement, séjour autorisé
- **REFUSEE_8J** : Refusée par les agents

## Différences avec la déclaration à 2 mois

- **Informations pré-remplies** : Les données de la déclaration à 2 mois sont pré-remplies
- **Effectifs définitifs** : Les effectifs doivent être confirmés ou mis à jour avec les données définitives
- **Détails obligatoires** : Les détails des accompagnants et encadrants deviennent obligatoires
- **Formation obligatoire** : La description de la formation en amont devient obligatoire

[Capture - Interface de saisie du formulaire à 8 jours] 