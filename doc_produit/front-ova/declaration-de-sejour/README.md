---
icon: memo-circle-info
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

# Déclaration de séjour

## Vue d'ensemble

Le processus de déclaration de séjour se déroule en **deux étapes distinctes** selon la réglementation :&#x20;

<table data-view="cards"><thead><tr><th></th><th data-hidden data-card-cover data-type="files"></th><th data-hidden data-card-target data-type="content-ref"></th></tr></thead><tbody><tr><td><strong>Déclaration à 2 mois</strong></td><td><a href="../../.gitbook/assets/photo-1749371930388-50c782b0acea.jpeg">photo-1749371930388-50c782b0acea.jpeg</a></td><td><a href="declaration-a-2-mois/">declaration-a-2-mois</a></td></tr><tr><td><strong>Déclaration à 8 jours</strong></td><td><a href="../../.gitbook/assets/photo-1748164685130-db6d3752d9e2.jpeg">photo-1748164685130-db6d3752d9e2.jpeg</a></td><td><a href="declaration-a-8-jours/">declaration-a-8-jours</a></td></tr></tbody></table>

***

## Processus et statuts

### **Workflow général**

```mermaid
flowchart TD
    %% Déclaration à 2 mois
    A[Organisateur] --> B[Création déclaration 2 mois]
    B --> C[BROUILLON]
    C --> D[Saisie formulaire 2 mois]
    D --> E{Formulaire complet ?}
    E -->|Non| D
    E -->|Oui| F[Transmission 2 mois]
    F --> G[TRANSMISE]
    
    G --> H[Agent DDETS]
    H --> I[EN_COURS]
    I --> J{Décision agent 2 mois}
    
    J -->|Valider| K[ATTENTE_8_JOUR]
    J -->|Compléments| L[A_MODIFIER]
    J -->|Refuser| M[REFUSEE]
    
    L --> N[Organisateur]
    N --> O[Modifications 2 mois]
    O --> F
    
    %% Déclaration à 8 jours
    K --> P[Organisateur]
    P --> Q{Séjour validé à 2 mois ?}
    Q -->|Non| R[Impossible - Déclaration 2 mois non validée]
    Q -->|Oui| S[Saisie formulaire 8 jours]
    
    S --> T{Formulaire complet ?}
    T -->|Non| S
    T -->|Oui| U[Transmission 8 jours]
    U --> V[TRANSMISE_8J]
    
    V --> W[Agent DDETS]
    W --> X[EN_COURS_8J]
    X --> Y{Décision agent 8 jours}
    
    Y -->|Valider définitivement| Z[VALIDEE_8J]
    Y -->|Compléments| AA[A_MODIFIER_8J]
    Y -->|Refuser| BB[REFUSEE_8J]
    
    AA --> CC[Organisateur]
    CC --> DD[Modifications 8 jours]
    DD --> U
    
    %% Fin de processus
    Z --> EE[Séjour autorisé]
    EE --> FF[SEJOUR_EN_COURS]
    FF --> GG[TERMINEE]
    
    M --> HH[Fin processus - Refusé 2 mois]
    BB --> II[Fin processus - Refusé 8 jours]
    
    %% Annulation
    C --> JJ[Annulation organisateur]
    JJ --> KK[ANNULEE]
    KK --> LL[Fin processus - Annulé]
    
    %% Styles avec couleurs DSFR
    style A fill:#6a6af4
    style H fill:#ff6f61
    style W fill:#ff6f61
    style Z fill:#3a7d44
    style L fill:#ff9c41
    style AA fill:#ff9c41
    style M fill:#ce5a5a
    style BB fill:#ce5a5a
    style KK fill:#8b5a9b
    style G fill:#e8e8e8
    style V fill:#e8e8e8
    style C fill:#f5f5f5
```

### **Les statuts du processus**

#### **Les statuts du processus**

| Statut                   | Signification                        | Actions possibles                      | Rôles autorisés       |
| ------------------------ | ------------------------------------ | -------------------------------------- | --------------------- |
| `BROUILLON`              | Déclaration en cours de saisie       | Saisie, transmission                   | Organisateur          |
| `TRANSMISE`              | Déclaration à 2 mois transmise       | Instruction par les agents             | Agent DDETS           |
| `EN_COURS`               | En instruction à 2 mois              | Validation, demande compléments, refus | Agent DDETS           |
| `A_MODIFIER`             | Compléments demandés à 2 mois        | Modification par l'organisateur        | Organisateur          |
| `ATTENTE_8_JOUR`         | Validée à 2 mois, en attente 8 jours | Saisie déclaration à 8 jours           | Organisateur          |
| `TRANSMISE_8J`           | Déclaration à 8 jours transmise      | Instruction par les agents             | Agent DDETS           |
| `EN_COURS_8J`            | En instruction à 8 jours             | Validation, demande compléments, refus | Agent DDETS           |
| `A_MODIFIER_8J`          | Compléments demandés à 8 jours       | Modification par l'organisateur        | Organisateur          |
| `VALIDEE_8J`             | Validée définitivement               | Séjour autorisé                        | Système (automatique) |
| `SEJOUR_EN_COURS`        | Séjour en cours                      | Suivi                                  | Système (automatique) |
| `TERMINEE`               | Séjour terminé                       | Archive                                | Système (automatique) |
| `REFUSEE` / `REFUSEE_8J` | Refusée                              | Fin de processus                       | Agent DDETS           |
| `ANNULEE`                | Annulée par l'organisateur           | Fin de processus                       | Organisateur          |
| `ABANDONNEE`             | Abandonnée                           | Fin de processus                       | Organisateur          |

```mermaid
flowchart TD
    %% États initiaux
    A[BROUILLON] --> B[TRANSMISE]
    A --> C[ANNULEE]
    A --> D[ABANDONNEE]
    
    %% Déclaration à 2 mois
    B --> E[EN_COURS]
    E --> F[ATTENTE_8_JOUR]
    E --> G[A_MODIFIER]
    E --> H[REFUSEE]
    
    G --> B
    
    %% Déclaration à 8 jours
    F --> I[TRANSMISE_8J]
    I --> J[EN_COURS_8J]
    J --> K[VALIDEE_8J]
    J --> L[A_MODIFIER_8J]
    J --> M[REFUSEE_8J]
    
    L --> I
    
    %% Fin de processus
    K --> N[SEJOUR_EN_COURS]
    N --> O[TERMINEE]
    
    %% Fins de traitement pour annulation et abandon
    C --> P[Fin de traitement - Annulé]
    D --> Q[Fin de traitement - Abandonné]
    H --> R[Fin de traitement - Refusé 2 mois]
    M --> S[Fin de traitement - Refusé 8 jours]
    
    %% Styles avec couleurs DSFR
    style A fill:#f5f5f5
    style B fill:#e8e8e8
    style I fill:#e8e8e8
    style E fill:#e8e8e8
    style J fill:#e8e8e8
    style F fill:#3a7d44
    style K fill:#3a7d44
    style G fill:#ff9c41
    style L fill:#ff9c41
    style H fill:#ce5a5a
    style M fill:#ce5a5a
    style C fill:#8b5a9b
    style D fill:#8b5a9b
    style N fill:#6a6af4
    style O fill:#6a6af4
    style P fill:#ce5a5a
    style Q fill:#ce5a5a
    style R fill:#ce5a5a
    style S fill:#ce5a5a
```

### **Règles métier importantes**

* **Obligation** : Toute déclaration à 2 mois doit être validée pour permettre la déclaration à 8 jours
* **Délais** : Respect strict des délais (2 mois et 8 jours avant le séjour)
* **Modifications** : Possibilité de modifier les informations jusqu'à la transmission
* **Notifications** : Emails automatiques à chaque étape du processus
* **Documents** : Génération automatique de PDF (déclarations et accusés de réception)
* **Logs** : chaque étape et chaque message sont enregistrés dans [l'historique de la déclaration](page-detaillee-declaration.md#id-3.-historique-de-la-declaration)
