---
icon: eye
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

# Consultation d'un EIG

## Vue d'ensemble

La **consultation d'un EIG** permet d'afficher les détails complets d'un événement indésirable grave déclaré sur la plateforme VAO. Cette page est accessible depuis la liste des EIG.

### 🎯 Fonctionnalités

- **Affichage détaillé** de l'EIG
- **Récapitulatif** des informations
- **Téléchargement** du document joint
- **Navigation** vers la modification (si brouillon)
- **Historique** des actions

## 📋 Interface utilisateur

### En-tête de l'EIG

![En-tête consultation EIG](.gitbook/assets/eig-consultation-header.png)

**Informations affichées :**
- **Numéro** de l'EIG
- **Statut** actuel (Brouillon, Envoyé, Lu)
- **Date de création**
- **Date de transmission** (si envoyé)
- **Date de lecture** (si lu)

### Informations du séjour

![Informations séjour](.gitbook/assets/eig-consultation-sejour.png)

**Détails du séjour :**
- **Code** de la déclaration
- **Libellé** du séjour
- **Période** (début-fin)
- **Territoire** de survenue
- **Statut** de la déclaration de séjour

### Types d'événements

![Types d'événements](.gitbook/assets/eig-consultation-types.png)

**Affichage des types :**
- **Catégories** d'événements
- **Types** spécifiques sélectionnés
- **Précisions** pour les types "Autre"
- **Format** : Liste organisée par catégorie

### Personnel impliqué

![Personnel impliqué](.gitbook/assets/eig-consultation-personnel.png)

**Informations du personnel :**
- **Nom et prénom**
- **Fonction** (encadrant/accompagnant)
- **Téléphone**
- **Attestation** de formation
- **Liste** des personnels présents

### Détails des faits

![Détails des faits](.gitbook/assets/eig-consultation-faits.png)

**Sections détaillées :**

#### **Déroulement des faits**
- **Description complète** des événements
- **Date et heure** de survenue
- **Circonstances** détaillées
- **Contexte** de l'incident

#### **Dispositions pour remédier**
- **Actions correctives** mises en place
- **Mesures** pour faire cesser le danger
- **Préventions** futures

#### **Dispositions prises à l'égard de la victime**
- **Actions** en faveur de la victime
- **Mesures** concernant l'auteur présumé
- **Suivi** mis en place

#### **Dispositions pour l'information**
- **Actions** d'information des familles
- **Communication** aux proches
- **Tuteurs légaux** informés

### Document joint

![Document joint](.gitbook/assets/eig-consultation-document.png)

**Gestion du document :**
- **Téléchargement** du fichier PDF
- **Nom** du fichier
- **Taille** du document
- **Date** de téléchargement
- **Format** : PDF uniquement

### Destinataires

![Destinataires](.gitbook/assets/eig-consultation-destinataires.png)

**Liste des destinataires :**

#### **DDETS**
- **Direction départementale** de l'emploi, du travail, des solidarités et de la protection des populations
- **Emails** des services compétents
- **Territoire** de survenue de l'incident

#### **DREETS**
- **Direction régionale** de l'économie, de l'emploi, du travail et des solidarités
- **Emails** des services compétents
- **Région** ayant délivré l'agrément

#### **Organisme**
- **Emails** de l'organisme déclarant
- **Notification** de transmission

## 🔄 Actions disponibles

### Modification (si brouillon)

![Modification EIG](.gitbook/assets/eig-consultation-modification.png)

**Conditions :**
- **Statut** : `BROUILLON`
- **Droits** : `EIG_ECRITURE`
- **Éligibilité** : Séjour encore éligible

**Actions possibles :**
- **Modification** des types d'événements
- **Édition** des renseignements généraux
- **Ajout/modification** du document joint
- **Transmission** de l'EIG

### Suppression (si brouillon)

![Suppression EIG](.gitbook/assets/eig-consultation-suppression.png)

**Conditions :**
- **Statut** : `BROUILLON`
- **Droits** : `EIG_ECRITURE`
- **Confirmation** obligatoire

**Processus :**
1. **Clic** sur le bouton de suppression
2. **Modal** de confirmation
3. **Suppression** définitive
4. **Redirection** vers la liste

### Retour à la liste

![Retour liste](.gitbook/assets/eig-consultation-retour.png)

**Navigation :**
- **Bouton** "Retour à la liste"
- **URL** : `/eig/liste`
- **Conservation** des filtres appliqués

## 📊 Statuts et notifications

### Statut BROUILLON

**Caractéristiques :**
- **Modifiable** par l'organisme
- **Non transmis** aux autorités
- **Supprimable** si nécessaire
- **Éligibilité** du séjour vérifiée

### Statut ENVOYE

**Caractéristiques :**
- **Transmis** aux DDETS et DREETS
- **Non modifiable** par l'organisme
- **En attente** de lecture par les autorités
- **Notifications** envoyées

### Statut LU

**Caractéristiques :**
- **Lu** par les autorités compétentes
- **Email** de notification envoyé à l'organisme
- **Historique** conservé
- **Traitement** terminé

### Notifications par email

**Lors du marquage comme lu :**
- **Destinataire** : Organisme déclarant
- **Objet** : "Consultation de votre EIG déposé sur la plateforme VAO"
- **Contenu** : Informations sur la consultation
- **Lien** vers la plateforme VAO

## 🔗 Navigation

### Depuis la liste des EIG

**Accès :**
- **Clic** sur une ligne du tableau
- **URL** : `/eig/{id}`
- **Conservation** du contexte de recherche

### Navigation interne

**Liens disponibles :**
- **Retour à la liste** : `/eig/liste`
- **Modification** : `/eig/{id}#eig-type-evenement`
- **Création** : `/eig`

### Breadcrumb

**Chemin de navigation :**
- **Accueil** → **EIG** → **Liste des EIG** → **Consultation EIG {id}**

## ⚠️ Messages d'erreur

### EIG introuvable

**Message :** "EIG non trouvé"

**Causes possibles :**
- **ID invalide** dans l'URL
- **EIG supprimé**
- **Droits insuffisants**

**Actions :**
- Vérifier l'URL
- Retourner à la liste
- Contacter l'administrateur

### Droits insuffisants

**Message :** "Vous n'êtes pas autorisé à accéder à cet EIG"

**Causes possibles :**
- **Rôle** `EIG_LECTURE` manquant
- **Organisme** différent
- **Session** expirée

**Actions :**
- Vérifier les droits d'accès
- Se reconnecter si nécessaire
- Contacter l'administrateur

### Erreur de téléchargement

**Message :** "Erreur lors du téléchargement du document"

**Causes possibles :**
- **Document** corrompu
- **Serveur** indisponible
- **Réseau** défaillant

**Actions :**
- Réessayer le téléchargement
- Vérifier la connexion
- Contacter le support

## 🔐 Droits d'accès

### Rôles requis

**Consultation :**
- `EIG_LECTURE` : Accès en lecture seule
- `EIG_ECRITURE` : Accès complet avec modification

### Restrictions

**Accès par organisme :**
- **Seuls** les EIG de l'organisme de l'utilisateur
- **Vérification** automatique des droits
- **Redirection** si accès non autorisé

## 📱 Responsive design

### Adaptation mobile

**Comportement :**
- **Sections** empilées verticalement
- **Tableaux** avec défilement horizontal
- **Boutons** adaptés à la taille d'écran

**Optimisations :**
- **Texte** tronqué avec ellipsis
- **Tooltips** sur les éléments tronqués
- **Navigation** tactile optimisée
- **Zoom** automatique sur les formulaires 