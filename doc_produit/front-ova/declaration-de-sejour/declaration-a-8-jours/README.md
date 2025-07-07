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
    
    D --> E[Étape 1 - Informations générales définitives]
    E --> F[Étape 2 - Informations vacanciers définitives]
    F --> G[Étape 3 - Informations personnel définitives]
    G --> H[Étape 4 - Sélection hébergements définitifs]
    H --> I[Étape 5 - Synthèse & Attestation]
    
    I --> J{Formulaire complet ?}
    J -->|Non| I
    J -->|Oui| K[Transmission]
    K --> L[TRANSMISE_8J]
    
    L --> M[Email notification agent DDETS]
    M --> N[Agent DDETS]
    
    N --> O[Prise en charge]
    O --> P[EN_COURS_8J]
    
    P --> Q{Décision agent}
    
    Q -->|Valider définitivement| R[VALIDEE_8J]
    R --> S[Email notification organisateur]
    S --> T[Séjour autorisé]
    
    Q -->|Compléments| U[A_MODIFIER_8J]
    U --> V[Email notification organisateur]
    V --> W[Organisateur]
    W --> X[Modifications]
    X --> I
    
    Q -->|Refuser| Y[REFUSEE_8J]
    Y --> Z[Email notification organisateur]
    Z --> AA[Fin processus - Refusé]
    
    style A fill:#6a6af4
    style N fill:#ff6f61
    style R fill:#3a7d44
    style U fill:#ff9c41
    style Y fill:#ce5a5a
    style C fill:#ce5a5a
    style L fill:#e8e8e8
    style P fill:#e8e8e8
    style D fill:#f5f5f5
```

## Différences avec la déclaration à 2 mois

* **Informations pré-remplies** : Les données de la déclaration à 2 mois sont pré-remplies
* **Effectifs définitifs** : Les effectifs doivent être confirmés ou mis à jour avec les données définitives
* **Détails obligatoires** : Les détails des accompagnants et encadrants deviennent obligatoires
* **Formation obligatoire** : La description de la formation en amont devient obligatoire
