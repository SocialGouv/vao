---
icon: circle-user
---

# Création de compte

{% hint style="warning" %}
**Important**\
La création de compte nécessite **une étape de validation obligatoire** avant de pouvoir accéder à la plateforme.

\
Cette validation peut être effectuée selon **2 scénarios spécifiques** :

1. L’organisme n’a pas encore de compte utilisateur sur la plateforme VAO (aucun SIRET rattaché) : c’est **la région** à laquelle est rattaché l’organisme qui validera la demande de création de compte
2. L’organisme a déjà un compte utilisateur sur la plateforme VAO (SIRET déjà renseigné sur la plateforme) : c’est **un utilisateur déjà inscrit** dont le compte est lié à l’organisme qui validera la demande de création de compte
{% endhint %}

```mermaid
flowchart TD
    A[Demande de création de compte] --> B{Organisme existe déjà ?}
    
    B -->|Non - Scénario 1| C[Validation DREETS]
    B -->|Oui - Scénario 2| D[Validation interne OVA]
    
    C --> E[Compte activé par DREETS]
    D --> F[Compte activé par 1er utilisateur OVA]
    
    E --> G[OVA peut utiliser le SI]
    F --> G
    
    style A fill:#e1f5fe
    style C fill:#fff3e0
    style D fill:#fff3e0
    style E fill:#e8f5e8
    style F fill:#e8f5e8
```

<table data-view="cards"><thead><tr><th></th><th data-hidden data-card-cover data-type="files"></th><th data-hidden data-card-target data-type="content-ref"></th></tr></thead><tbody><tr><td><strong>Scénario 1 - L'organisme n'existe pas sur la plateforme VAO</strong></td><td><a href="../../.gitbook/assets/wesley-tingey-ZdOW9Qd8mQo-unsplash.jpg">wesley-tingey-ZdOW9Qd8mQo-unsplash.jpg</a></td><td><a href="scenario-1-lorganisme-nexiste-pas-sur-la-plateforme-vao.md">scenario-1-lorganisme-nexiste-pas-sur-la-plateforme-vao.md</a></td></tr><tr><td><strong>Scénario 2 – L'organisme a déjà un ou plusieurs comptes utilisateurs sur la plateforme VAO</strong></td><td><a href="../../.gitbook/assets/sumner-mahaffey-7Y0NshQLohk-unsplash.jpg">sumner-mahaffey-7Y0NshQLohk-unsplash.jpg</a></td><td><a href="scenario-2-lorganisme-a-deja-un-ou-plusieurs-comptes-utilisateurs-sur-la-plateforme-vao.md">scenario-2-lorganisme-a-deja-un-ou-plusieurs-comptes-utilisateurs-sur-la-plateforme-vao.md</a></td></tr></tbody></table>
