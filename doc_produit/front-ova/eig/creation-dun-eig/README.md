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

# Création d'un EIG

La **création d'un EIG** se fait en plusieurs étapes via un formulaire guidé. Le processus permet de déclarer un événement indésirable grave survenu lors d'un séjour de vacances adaptées organisées.

Le parcours de création d'un EIG se fait par un formulaire en plusieurs étapes :&#x20;

* [Étape 1 - Sélection du séjour](etape-1-selection-du-sejour.md)
* [Étape 2 - Type d'événement](etape-2-type-devenement.md)
* [Étape 3 - Renseignement généraux](etape-3-renseignements-generaux.md)
* [Étape 4 - Récapitulatif](etape-4-recapitulatif.md)

***

## Workflow&#x20;

```mermaid
flowchart TD
    A[Organisateur] --> B[Création EIG]
    B --> C[BROUILLON]
    C --> D[Sélection séjour éligible]
    D --> E[Types d'événements]
    E --> F[Renseignements généraux]
    F --> G[Récapitulatif]
    G --> H[Transmission EIG]
    H --> I[ENVOYE]
    
    I --> J[DDETS du département]
    I --> K[DREETS de la région]
    
    J --> L[Marquage comme lu]
    K --> M[Marquage comme lu]
    
    L --> N[LU]
    M --> O[LU]
    
    N --> P[Email notification à l'organisme]
    O --> Q[Email notification à l'organisme]
```

## Statuts&#x20;

```mermaid
stateDiagram-v2
    [*] --> BROUILLON: Création
    BROUILLON --> ENVOYE: Transmission
    ENVOYE --> LU: Marquage comme lu par DDETS/DREETS
    LU --> [*]: Traitement terminé
    
    note right of BROUILLON
        EIG en cours de saisie
        Modifiable par l'organisme
    end note
    
    note right of ENVOYE
        EIG transmis aux autorités
        Plus modifiable
        En attente de lecture
    end note
    
    note right of LU
        EIG lu par les autorités
        Email de notification envoyé
        Traitement terminé
    end note
```
