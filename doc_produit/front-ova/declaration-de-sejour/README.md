---
icon: memo-circle-info
---

# Déclaration de séjour

{% hint style="info" %}
Cette section détaille le parcours utilisateur, les étapes du formulaire, la gestion des statuts, des rôles et des droits, ainsi que les cas particuliers.
{% endhint %}

## Vue d'ensemble

Le processus de déclaration de séjour se déroule en **deux étapes distinctes** selon la réglementation :

### **Déclaration à 2 mois (obligatoire)**
Déclarer l'intention d'organiser un séjour au moins 2 mois avant le début du séjour.

### **Déclaration à 8 jours (si validée à 2 mois)**
Confirmer les informations définitives du séjour 8 jours avant le début.

## Chapitrage

### Déclaration à 2 mois
1. [Étape 1 - Informations générales](declaration-a-2-mois/etape-1-informations-generales.md)
2. [Étape 2 - Informations sur les vacanciers](declaration-a-2-mois/etape-2-informations-sur-les-vacanciers.md)
3. [Étape 3 - Informations sur le personnel](declaration-a-2-mois/etape-3-informations-sur-le-personnel.md)
4. [Menu et étapes du formulaire](declaration-a-2-mois/menu-etapes-formulaire.md)

### Déclaration à 8 jours
1. [Étape 1 - Informations générales](declaration-a-8-jours/etape-1-informations-generales.md)
2. [Étape 2 - Informations sur les vacanciers](declaration-a-8-jours/etape-2-informations-sur-les-vacanciers.md)
3. [Étape 3 - Informations sur le personnel](declaration-a-8-jours/etape-3-informations-sur-le-personnel.md)
4. [Menu et étapes du formulaire](declaration-a-8-jours/menu-etapes-formulaire.md)

## Processus et statuts

### **Workflow général**

**Déclaration à 2 mois :**
1. **Création** : L'organisateur crée une déclaration en statut `BROUILLON`
2. **Saisie** : Remplissage complet du formulaire
3. **Transmission** : L'organisateur transmet → statut `TRANSMISE`
4. **Instruction** : Les agents DDETS prennent en charge → statut `EN_COURS`
5. **Décision** : Les agents peuvent valider, demander des compléments ou refuser

**Déclaration à 8 jours :**
1. **Déclenchement** : Seulement si la déclaration à 2 mois est validée (statut `ATTENTE_8_JOUR`)
2. **Saisie** : Mise à jour des informations définitives
3. **Transmission** : L'organisateur transmet → statut `TRANSMISE_8J`
4. **Instruction** : Les agents prennent en charge → statut `EN_COURS_8J`
5. **Décision** : Validation finale, compléments ou refus

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
