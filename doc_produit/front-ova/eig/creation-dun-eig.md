---
icon: plus-circle
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

## Vue d'ensemble

La **création d'un EIG** se fait en plusieurs étapes via un formulaire guidé. Le processus permet de déclarer un événement indésirable grave survenu lors d'un séjour de vacances adaptées organisées.

### 🎯 Fonctionnalités

- **Sélection du séjour** éligible
- **Définition des types** d'événements
- **Saisie des renseignements** généraux
- **Récapitulatif** avant transmission
- **Transmission** aux autorités compétentes

## 📋 Étapes du formulaire

### Étape 1 : Sélection du séjour

![Sélection du séjour](.gitbook/assets/eig-creation-selection-sejour.png)

**Fonctionnalités :**
- **Recherche** par code ou libellé de séjour
- **Filtrage** automatique des séjours éligibles
- **Téléchargement** du formulaire EIG
- **Affichage** du récapitulatif si EIG existant

**Séjours éligibles :**
- **En cours** ou **terminés** depuis moins d'une semaine
- **Statuts** : `VALIDEE_8J`, `SEJOUR_EN_COURS`, `TERMINEE`
- **Période** : Date de début ≤ aujourd'hui ≤ Date de fin + 1 semaine

**Recherche :**
- **Champ de recherche** : Code ou libellé du séjour
- **Résultats** : Maximum 10 séjours affichés
- **Format** : Tags cliquables avec informations détaillées

### Étape 2 : Types d'événements

![Types d'événements](.gitbook/assets/eig-creation-types.png)

**Catégories disponibles :**

#### **Victimes**
- Violences sexuelles
- Viols
- Violences psychologiques et morales
- Violences physiques
- Non respect de la prescription médicale
- Privation de droit
- Négligence grave ou erreurs successives
- Maltraitances non précisées
- Suicide (suspecté ou avéré)
- Tentative de suicide
- **Autre, à préciser** (champ obligatoire)

#### **Santé**
- Épidémie
- Accident corporel (chute, etc…)
- **Autre, à préciser** (champ obligatoire)

#### **Sécurité**
- Vols
- Fugue
- Actes de malveillance
- Intoxication alimentaire
- Départ de feu
- Incendie
- Inondation
- **Autre, à préciser** (champ obligatoire)

#### **Fonctionnement organisme**
- Procédures judiciaires à l'encontre de personnels
- Défaillance de personnels
- Défaillances techniques
- Conflits ou menaces de conflits internes
- **Autre, à préciser** (champ obligatoire)

**Validation :**
- **Au moins un type** sélectionné obligatoire
- **Précision obligatoire** pour les types "Autre"
- **Minimum 5 caractères** pour les précisions

### Étape 3 : Renseignements généraux

![Renseignements généraux](.gitbook/assets/eig-creation-renseignements.png)

**Champs à renseigner :**

#### **Personnel présent lors de l'événement**
- **Sélection** parmi le personnel du séjour
- **Encadrants** et **accompagnants** disponibles
- **Informations** : nom, prénom, fonction, téléphone
- **Attestation** de formation requise

#### **Déroulement des faits**
- **Description détaillée** : date, heure, circonstances
- **Champ obligatoire**
- **Format** : Zone de texte libre
- **Validation** : Minimum 5 caractères

#### **Dispositions pour remédier**
- **Actions correctives** mises en place
- **Mesures** pour faire cesser le danger
- **Champ obligatoire**
- **Format** : Zone de texte libre

#### **Dispositions prises à l'égard de la victime**
- **Actions** en faveur de la victime
- **Mesures** concernant l'auteur présumé
- **Champ obligatoire**
- **Format** : Zone de texte libre

#### **Dispositions pour l'information**
- **Actions** d'information des familles
- **Communication** aux proches ou tuteurs légaux
- **Champ obligatoire**
- **Format** : Zone de texte libre

### Étape 4 : Récapitulatif

![Récapitulatif EIG](.gitbook/assets/eig-creation-recapitulatif.png)

**Informations affichées :**

#### **Séjour sélectionné**
- **Code** de la déclaration
- **Libellé** du séjour
- **Période** (début-fin)
- **Territoire** de survenue

#### **Types d'événements**
- **Liste** des types sélectionnés
- **Précisions** pour les types "Autre"
- **Catégories** d'événements

#### **Personnel impliqué**
- **Liste** du personnel présent
- **Fonctions** et coordonnées
- **Attestations** de formation

#### **Détails des faits**
- **Déroulement** complet des événements
- **Dispositions** prises
- **Actions** correctives

#### **Document joint**
- **Téléchargement** de document PDF
- **Taille maximale** : 5 Mo
- **Format** : PDF uniquement

#### **Destinataires**
- **DDETS** du département
- **DREETS** de la région
- **Organisme** déclarant

## 🔄 Navigation entre étapes

### Boutons de navigation

**Boutons disponibles :**
- **Précédent** : Retour à l'étape précédente
- **Suivant** : Validation et passage à l'étape suivante
- **Terminer** : Transmission finale de l'EIG

**Comportement :**
- **Sauvegarde automatique** à chaque étape
- **Validation** des données avant passage
- **Messages d'erreur** en cas de problème

### Validation des étapes

**Règles de validation :**

#### **Étape 1 - Séjour**
- ✅ Séjour sélectionné
- ✅ Séjour éligible

#### **Étape 2 - Types**
- ✅ Au moins un type sélectionné
- ✅ Précisions renseignées si "Autre"

#### **Étape 3 - Renseignements**
- ✅ Tous les champs obligatoires remplis
- ✅ Personnel sélectionné
- ✅ Descriptions complètes

#### **Étape 4 - Récapitulatif**
- ✅ Document joint (optionnel)
- ✅ Validation finale

## 📁 Gestion des documents

### Téléchargement du formulaire

**Formulaire EIG :**
- **Lien** : Téléchargement direct
- **Format** : PDF
- **Nom** : `eig.pdf`
- **Contenu** : Formulaire officiel EIG

### Document joint

**Caractéristiques :**
- **Format accepté** : PDF uniquement
- **Taille maximale** : 5 Mo
- **Nom par défaut** : `document_eig`
- **Stockage** : Chiffré sur le serveur

**Processus de téléchargement :**
1. **Sélection** du fichier PDF
2. **Validation** du format et de la taille
3. **Upload** vers le serveur
4. **Chiffrement** et stockage
5. **Confirmation** de téléchargement

## ⚠️ Messages d'erreur

### Erreurs de validation

**Types d'événements :**
- **Message** : "Ce champ est obligatoire"
- **Cause** : Aucun type sélectionné
- **Solution** : Sélectionner au moins un type

**Précisions manquantes :**
- **Message** : "Ce champ doit faire au moins 5 caractères"
- **Cause** : Précision insuffisante pour type "Autre"
- **Solution** : Renseigner une précision détaillée

**Champs obligatoires :**
- **Message** : "Ce champ est obligatoire"
- **Cause** : Champ requis non rempli
- **Solution** : Compléter tous les champs requis

### Erreurs de téléchargement

**Format invalide :**
- **Message** : "Format autorisé : PDF uniquement"
- **Cause** : Fichier non PDF
- **Solution** : Convertir en PDF

**Taille excessive :**
- **Message** : "Taille maximale : 5 Mo"
- **Cause** : Fichier trop volumineux
- **Solution** : Réduire la taille du fichier

### Erreurs de transmission

**Transmission échouée :**
- **Message** : "Une erreur est survenue lors de la transmission"
- **Cause** : Problème serveur ou réseau
- **Solution** : Réessayer la transmission

## 🔐 Droits d'accès

### Rôles requis

**Création d'EIG :**
- `EIG_ECRITURE` obligatoire
- Vérification des droits à chaque étape

### Restrictions

**Éligibilité des séjours :**
- Séjours en cours ou terminés depuis moins d'une semaine
- Statuts : `VALIDEE_8J`, `SEJOUR_EN_COURS`, `TERMINEE`
- Droits sur l'organisme du séjour

## 📱 Responsive design

### Adaptation mobile

**Comportement :**
- **Étapes** empilées verticalement
- **Formulaires** adaptés à l'écran tactile
- **Navigation** optimisée pour mobile

**Optimisations :**
- **Boutons** de taille adaptée
- **Champs** de saisie optimisés
- **Messages** d'erreur visibles 