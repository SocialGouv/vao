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

# Déclaration à 8 jours

La déclaration à 8 jours est la deuxième étape du processus de déclaration de séjour. Elle ne peut être effectuée que si la déclaration à 2 mois a été validée par les agents DDETS.

## Objectif

Confirmer les informations définitives du séjour 8 jours avant le début.

## Étapes du formulaire

* [Étape 1 - Informations générales](etape-1-informations-generales.md)
* [Étape 2 - Informations sur les vacanciers](etape-2-informations-sur-les-vacanciers.md)
* [Étape 3 - Informations sur le personnel](etape-3-informations-sur-le-personnel.md)
* [Étape 4 - Sélection des hébergements](etape-4-selection-des-hebergements.md)
* [Étape 5 - Synthèse](etape-5-synthese.md)

## Workflow

```mermaid
flowchart TD
    A[Organisateur] --> B{Prérequis vérifiés ?}
    B -->|Non| C[Impossible - Déclaration 2 mois non validée]
    B -->|Oui| D[ATTENTE_8_JOUR]
    D --> E[Saisie formulaire définitif]
    E --> F{Formulaire complet ?}
    F -->|Non| E
    F -->|Oui| G[Transmission]
    G --> H[TRANSMISE_8J]
    H --> I[Agent DDETS]
    I --> J[EN_COURS_8J]
    J --> K{Décision agent}
    K -->|Valider définitivement| L[VALIDEE_8J]
    K -->|Compléments| M[A_MODIFIER_8J]
    K -->|Refuser| N[REFUSEE_8J]
    M --> O[Organisateur]
    O --> P[Modifications]
    P --> G
    L --> Q[Séjour autorisé]
    N --> R[Fin processus - Refusé]
    
    style A fill:#e1f5fe
    style I fill:#fff3e0
    style L fill:#e8f5e8
    style N fill:#ffebee
    style M fill:#fff8e1
    style C fill:#ffebee
```

## Différences avec la déclaration à 2 mois

* **Informations pré-remplies** : Les données de la déclaration à 2 mois sont pré-remplies
* **Effectifs définitifs** : Les effectifs doivent être confirmés ou mis à jour avec les données définitives
* **Détails obligatoires** : Les détails des accompagnants et encadrants deviennent obligatoires
* **Formation obligatoire** : La description de la formation en amont devient obligatoire
