# Workflow des déclarations

Cette page présente les diagrammes de workflow pour les déclarations de séjour à 2 mois et à 8 jours.

***

## Workflow complet - Vue d'ensemble

```mermaid
flowchart TD
    A[Organisateur] --> B[Déclaration à 2 mois]
    B --> C[Création BROUILLON]
    C --> D[Saisie étapes 1-2-3]
    D --> E[Transmission]
    E --> F[Agent DDETS - Instruction]
    F --> G{Décision 2 mois}
    G -->|Valider| H[ATTENTE_8_JOUR]
    G -->|Compléments| I[Retour organisateur]
    G -->|Refuser| J[REFUSEE - Fin]
    I --> D
    H --> K[Déclaration à 8 jours]
    K --> L[Saisie définitives]
    L --> M[Transmission]
    M --> N[Agent DDETS - Instruction]
    N --> O{Décision 8 jours}
    O -->|Valider définitivement| P[VALIDEE_8J - Séjour autorisé]
    O -->|Compléments| Q[Retour organisateur]
    O -->|Refuser| R[REFUSEE_8J - Fin]
    Q --> L
    
    style A fill:#e1f5fe
    style F fill:#fff3e0
    style N fill:#fff3e0
    style P fill:#e8f5e8
    style J fill:#ffebee
    style R fill:#ffebee
```

### **Points clés du workflow complet :**

* **Séquence obligatoire** : 2 mois → 8 jours
* **Validation conditionnelle** : 8 jours possible seulement si 2 mois validé
* **Boucles de correction** : Possibilité de modifications à chaque étape
* **Décisions finales** : Validation définitive ou refus à 8 jours

***

## Statuts et transitions

```mermaid
stateDiagram-v2
    [*] --> BROUILLON
    BROUILLON --> TRANSMISE : Transmission organisateur
    TRANSMISE --> EN_COURS : Prise en charge agent
    EN_COURS --> ATTENTE_8_JOUR : Validation agent
    EN_COURS --> A_MODIFIER : Demande compléments
    EN_COURS --> REFUSEE : Refus agent
    A_MODIFIER --> BROUILLON : Modifications organisateur
    ATTENTE_8_JOUR --> TRANSMISE_8J : Transmission 8 jours
    TRANSMISE_8J --> EN_COURS_8J : Prise en charge agent
    EN_COURS_8J --> VALIDEE_8J : Validation définitive
    EN_COURS_8J --> A_MODIFIER_8J : Demande compléments
    EN_COURS_8J --> REFUSEE_8J : Refus agent
    A_MODIFIER_8J --> TRANSMISE_8J : Modifications organisateur
    VALIDEE_8J --> SEJOUR_EN_COURS : Début séjour
    SEJOUR_EN_COURS --> TERMINEE : Fin séjour
    REFUSEE --> [*]
    REFUSEE_8J --> [*]
```

### **Légende des statuts :**

* **Bleu** : Statuts de saisie par l'organisateur
* **Orange** : Statuts d'instruction par les agents
* **Vert** : Statuts de validation
* **Rouge** : Statuts de refus
* **Jaune** : Statuts de modification demandée
