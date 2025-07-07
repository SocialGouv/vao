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

# Déclaration à 2 mois

La déclaration à 2 mois est la première étape obligatoire du processus de déclaration de séjour. Elle permet de déclarer l'intention d'organiser un séjour au moins 2 mois avant le début du séjour.

## Objectif

Déclarer l'intention d'organiser un séjour au moins 2 mois avant le début du séjour.

## Étapes du formulaire

* [Étape 1 - Informations générales](etape-1-informations-generales.md)
* [Étape 2 - Informations sur les vacanciers](etape-2-informations-sur-les-vacanciers.md)
* [Étape 3 - Informations sur le personnel](etape-3-informations-sur-le-personnel.md)
* [Étape 4 - Projet de séjour](etape-4-projet-de-sejour.md)
* [Étape 5 - Informations sur le transport](etape-5-informations-sur-le-transport.md)
* [Étape 6 - Informations sanitaires](etape-6-informations-sanitaires.md)
* [Étape 7 - Sélection des hébergements](etape-7-selection-des-hebergements.md)
* [Étape 8 - Synthèse](etape-8-synthese.md)

## Workflow

```mermaid
flowchart TD
    A[Organisateur] --> B[Création déclaration]
    B --> C[BROUILLON]
    
    C --> D[Étape 1 - Informations générales]
    D --> E[Étape 2 - Informations vacanciers]
    E --> F[Étape 3 - Informations personnel]
    F --> G[Étape 4 - Projet de séjour]
    G --> H[Étape 5 - Informations transport]
    H --> I[Étape 6 - Informations sanitaires]
    I --> J[Étape 7 - Sélection hébergements]
    J --> K[Étape 8 - Synthèse & Attestation]
    
    K --> L{Formulaire complet ?}
    L -->|Non| K
    L -->|Oui| M[Transmission]
    M --> N[TRANSMISE]
    
    N --> O[Email notification agent DDETS]
    O --> P[Agent DDETS]
    
    P --> Q[Prise en charge]
    Q --> R[EN_COURS]
    
    R --> S{Décision agent}
    
    S -->|Valider| T[ATTENTE_8_JOUR]
    T --> U[Email notification organisateur]
    U --> V[Fin processus 2 mois - Attente déclaration 8 jours]
    
    S -->|Compléments| W[A_MODIFIER]
    W --> X[Email notification organisateur]
    X --> Y[Organisateur]
    Y --> Z[Modifications]
    Z --> K
    
    S -->|Refuser| AA[REFUSEE]
    AA --> BB[Email notification organisateur]
    BB --> CC[Fin processus - Refusé]
    
    C --> DD[Annulation organisateur]
    DD --> EE[ANNULEE]
    EE --> FF[Fin processus - Annulé]
    
    style A fill:#6a6af4
    style P fill:#ff6f61
    style T fill:#3a7d44
    style W fill:#ff9c41
    style AA fill:#ce5a5a
    style EE fill:#8b5a9b
    style N fill:#e8e8e8
    style R fill:#e8e8e8
    style C fill:#f5f5f5
```

