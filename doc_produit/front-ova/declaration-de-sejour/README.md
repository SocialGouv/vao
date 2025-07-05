---
icon: memo-circle-info
---

# Déclaration de séjour

{% hint style="info" %}
Cette section détaille le parcours utilisateur, les étapes du formulaire, la gestion des statuts, des rôles et des droits, ainsi que les cas particuliers.
{% endhint %}

## Chapitrage

1. Menu et étapes du formulaire
2. Saisie et validation des informations
3. Gestion des pièces jointes
4. Suivi des statuts et notifications
5. Gestion des rôles et droits
6. Cas particuliers

> **À chaque étape clé, insérer une capture d'écran de l'interface pour illustrer le contexte utilisateur.**

***

## Processus de déclaration de séjour

Le processus de déclaration de séjour se déroule en **deux étapes distinctes** selon la réglementation :

### **Étape 1 : Déclaration à 2 mois (obligatoire)**

**Objectif** : Déclarer l'intention d'organiser un séjour au moins 2 mois avant le début du séjour.

**Workflow** :
1. **Création** : L'organisateur crée une déclaration en statut `BROUILLON`
2. **Saisie** : Remplissage complet du formulaire (informations générales, vacanciers, personnel, projet de séjour, transport, sanitaires, hébergements)
3. **Transmission** : L'organisateur transmet la déclaration → statut `TRANSMISE`
4. **Instruction** : Les agents DDETS prennent en charge → statut `EN_COURS`
5. **Décision** : Les agents peuvent :
   - **Valider** → statut `ATTENTE_8_JOUR` (autorisation de procéder)
   - **Demander des compléments** → statut `A_MODIFIER` (retour à l'organisateur)
   - **Refuser** → statut `REFUSEE` (fin de processus)

[Capture - Interface de saisie du formulaire à 2 mois]

### **Étape 2 : Déclaration à 8 jours (si validée à 2 mois)**

**Objectif** : Confirmer les informations définitives du séjour 8 jours avant le début.

**Workflow** :
1. **Déclenchement** : Seulement si la déclaration à 2 mois est validée (statut `ATTENTE_8_JOUR`)
2. **Saisie** : Mise à jour des informations vacanciers et personnel avec données définitives
3. **Transmission** : L'organisateur transmet → statut `TRANSMISE_8J`
4. **Instruction** : Les agents prennent en charge → statut `EN_COURS_8J`
5. **Décision** : Les agents peuvent :
   - **Valider définitivement** → statut `VALIDEE_8J` (autorisation finale)
   - **Demander des compléments** → statut `A_MODIFIER_8J`
   - **Refuser** → statut `REFUSEE_8J`

[Capture - Interface de saisie du formulaire à 8 jours]

### **Statuts du processus**

| Statut | Signification | Actions possibles |
|--------|---------------|-------------------|
| `BROUILLON` | Déclaration en cours de saisie | Saisie, transmission |
| `TRANSMISE` | Déclaration à 2 mois transmise | Instruction par les agents |
| `EN_COURS` | En instruction à 2 mois | Validation, demande compléments, refus |
| `A_MODIFIER` | Compléments demandés à 2 mois | Modification par l'organisateur |
| `ATTENTE_8_JOUR` | Validée à 2 mois, en attente 8 jours | Saisie déclaration à 8 jours |
| `TRANSMISE_8J` | Déclaration à 8 jours transmise | Instruction par les agents |
| `EN_COURS_8J` | En instruction à 8 jours | Validation, demande compléments, refus |
| `A_MODIFIER_8J` | Compléments demandés à 8 jours | Modification par l'organisateur |
| `VALIDEE_8J` | Validée définitivement | Séjour autorisé |
| `SEJOUR_EN_COURS` | Séjour en cours | Suivi |
| `TERMINEE` | Séjour terminé | Archive |
| `REFUSEE` / `REFUSEE_8J` | Refusée | Fin de processus |
| `ANNULEE` | Annulée par l'organisateur | Fin de processus |

### **Règles métier importantes**

- **Obligation** : Toute déclaration à 2 mois doit être validée pour permettre la déclaration à 8 jours
- **Délais** : Respect strict des délais (2 mois et 8 jours avant le séjour)
- **Modifications** : Possibilité de modifier les informations jusqu'à la transmission
- **Notifications** : Emails automatiques à chaque étape du processus
- **Documents** : Génération automatique de PDF (déclarations et accusés de réception)

[Capture - Tableau de bord des déclarations avec statuts]
