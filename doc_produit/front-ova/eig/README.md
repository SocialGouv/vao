---
icon: siren
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

# EIG

Les **Événements Indésirables Graves (EIG)** sont des incidents survenant lors de séjours de vacances adaptées organisées qui présentent des risques graves pour la santé, l'intégrité ou le bien-être physique et moral des personnes handicapées majeures.

{% hint style="info" %}
**📋 Cadre réglementaire**

L'article R. 412-14-1 du code du tourisme prévoit que les personnes responsables de l'organisation du séjour sur le lieu de vacances sont tenues d'informer sans délai :

* **Le préfet du département** du lieu de séjour
* **Le préfet de région** qui a délivré l'agrément

de tout accident grave ainsi que de toute situation présentant ou ayant présenté des risques graves pour la santé, l'intégrité ou le bien-être physique et moral des personnes handicapées majeures.
{% endhint %}



## Workflow des EIG

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

## Statuts des EIG

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

