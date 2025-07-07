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

### **Les statuts du processus**

| Statut                   | Signification                        | Actions possibles                      |
| ------------------------ | ------------------------------------ | -------------------------------------- |
| `BROUILLON`              | Déclaration en cours de saisie       | Saisie, transmission                   |
| `TRANSMISE`              | Déclaration à 2 mois transmise       | Instruction par les agents             |
| `EN_COURS`               | En instruction à 2 mois              | Validation, demande compléments, refus |
| `A_MODIFIER`             | Compléments demandés à 2 mois        | Modification par l'organisateur        |
| `ATTENTE_8_JOUR`         | Validée à 2 mois, en attente 8 jours | Saisie déclaration à 8 jours           |
| `TRANSMISE_8J`           | Déclaration à 8 jours transmise      | Instruction par les agents             |
| `EN_COURS_8J`            | En instruction à 8 jours             | Validation, demande compléments, refus |
| `A_MODIFIER_8J`          | Compléments demandés à 8 jours       | Modification par l'organisateur        |
| `VALIDEE_8J`             | Validée définitivement               | Séjour autorisé                        |
| `SEJOUR_EN_COURS`        | Séjour en cours                      | Suivi                                  |
| `TERMINEE`               | Séjour terminé                       | Archive                                |
| `REFUSEE` / `REFUSEE_8J` | Refusée                              | Fin de processus                       |
| `ANNULEE`                | Annulée par l'organisateur           | Fin de processus                       |

### **Règles métier importantes**

* **Obligation** : Toute déclaration à 2 mois doit être validée pour permettre la déclaration à 8 jours
* **Délais** : Respect strict des délais (2 mois et 8 jours avant le séjour)
* **Modifications** : Possibilité de modifier les informations jusqu'à la transmission
* **Notifications** : Emails automatiques à chaque étape du processus
* **Documents** : Génération automatique de PDF (déclarations et accusés de réception)
* **Logs** : chaque étape et chaque message sont enregistrés dans [l'historique de la déclaration](page-detaillee-declaration.md#id-3.-historique-de-la-declaration)
