---
icon: tag
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

# Types d'événements EIG

## Vue d'ensemble

Les **types d'événements EIG** permettent de catégoriser et préciser la nature des événements indésirables graves survenus lors de séjours de vacances adaptées organisées. Cette classification facilite le traitement et l'analyse des incidents par les autorités compétentes.

### 🎯 Objectifs

- **Standardisation** des déclarations
- **Facilitation** du traitement par les autorités
- **Analyse** statistique des incidents
- **Prévention** ciblée des risques

## 📊 Classification des événements

### Catégorie : Victimes

![Types victimes](.gitbook/assets/eig-types-victimes.png)

**Événements concernant les personnes handicapées :**

| Type d'événement | Description | Précision requise |
|------------------|-------------|-------------------|
| **Violences sexuelles** | Agressions sexuelles de toute nature | Non |
| **Viols** | Viols avérés ou tentatives | Non |
| **Violences psychologiques et morales** | Harcèlement, humiliation, chantage | Non |
| **Violences physiques** | Coups, blessures, maltraitance physique | Non |
| **Non respect de la prescription médicale** | Non-application des soins prescrits | Non |
| **Privation de droit** | Restriction des libertés fondamentales | Non |
| **Négligence grave ou erreurs successives** | Manquements répétés aux obligations | Non |
| **Maltraitances non précisées** | Autres formes de maltraitance | Non |
| **Suicide (suspecté ou avéré)** | Tentative ou acte suicidaire | Non |
| **Tentative de suicide** | Tentative de suicide | Non |
| **Autre, à préciser** | Autre événement non listé | **Obligatoire** |

### Catégorie : Santé

![Types santé](.gitbook/assets/eig-types-sante.png)

**Événements liés à la santé :**

| Type d'événement | Description | Précision requise |
|------------------|-------------|-------------------|
| **Épidémie** | Propagation de maladie infectieuse | Non |
| **Accident corporel (chute, etc…)** | Accidents physiques divers | Non |
| **Autre, à préciser** | Autre événement de santé | **Obligatoire** |

### Catégorie : Sécurité

![Types sécurité](.gitbook/assets/eig-types-securite.png)

**Événements de sécurité :**

| Type d'événement | Description | Précision requise |
|------------------|-------------|-------------------|
| **Vols** | Vols de biens ou d'argent | Non |
| **Fugue** | Départ non autorisé d'un participant | Non |
| **Actes de malveillance** | Vandalisme, sabotage | Non |
| **Intoxication alimentaire** | Empoisonnement alimentaire | Non |
| **Départ de feu** | Début d'incendie | Non |
| **Incendie** | Incendie déclaré | Non |
| **Inondation** | Inondation des locaux | Non |
| **Autre, à préciser** | Autre événement de sécurité | **Obligatoire** |

### Catégorie : Fonctionnement organisme

![Types fonctionnement](.gitbook/assets/eig-types-fonctionnement.png)

**Événements liés au fonctionnement :**

| Type d'événement | Description | Précision requise |
|------------------|-------------|-------------------|
| **Procédures judiciaires à l'encontre de personnels** | Actions en justice contre le personnel | Non |
| **Défaillance de personnels** | Absence, incompétence, comportement inapproprié | Non |
| **Défaillances techniques** | Pannes, dysfonctionnements matériels | Non |
| **Conflits ou menaces de conflits internes** | Tensions entre personnels | Non |
| **Autre, à préciser** | Autre événement de fonctionnement | **Obligatoire** |

## ✅ Validation des types

### Règles de validation

**Sélection obligatoire :**
- **Au moins un type** doit être sélectionné
- **Combinaison** de types possible
- **Catégories multiples** autorisées

**Précisions pour "Autre" :**
- **Champ obligatoire** pour tous les types "Autre"
- **Minimum 5 caractères** requis
- **Description détaillée** attendue
- **Contexte** de l'événement

### Messages d'erreur

**Aucun type sélectionné :**
- **Message** : "Ce champ est obligatoire"
- **Solution** : Sélectionner au moins un type

**Précision manquante :**
- **Message** : "Ce champ doit faire au moins 5 caractères"
- **Solution** : Renseigner une précision détaillée

**Précision insuffisante :**
- **Message** : "Ce champ doit faire au moins 5 caractères"
- **Solution** : Développer la description

## 🔄 Interface de sélection

### Interface de sélection

![Interface sélection types](.gitbook/assets/eig-selection-types.png)

**Fonctionnalités :**
- **Cases à cocher** pour chaque type
- **Groupement** par catégorie
- **Sélection multiple** possible
- **Validation** en temps réel

### Champs de précision

![Champs précision](.gitbook/assets/eig-precision-types.png)

**Comportement :**
- **Affichage conditionnel** pour les types "Autre"
- **Champs obligatoires** avec validation
- **Zone de texte** libre
- **Compteur** de caractères

## 📊 Statistiques d'utilisation

### Répartition par catégorie

**Données anonymisées :**
- **Victimes** : ~40% des déclarations
- **Sécurité** : ~30% des déclarations
- **Santé** : ~20% des déclarations
- **Fonctionnement** : ~10% des déclarations

### Types les plus fréquents

**Top 5 des types déclarés :**
1. **Violences psychologiques et morales**
2. **Accident corporel (chute, etc…)**
3. **Non respect de la prescription médicale**
4. **Fugue**
5. **Défaillance de personnels**

## 🔗 Intégration avec le workflow

### Dans la création d'EIG

**Étape 2 du formulaire :**
- **Sélection** des types d'événements
- **Validation** des précisions
- **Sauvegarde** automatique
- **Navigation** vers l'étape suivante

### Dans la consultation

**Affichage organisé :**
- **Groupement** par catégorie
- **Liste** des types sélectionnés
- **Précisions** affichées
- **Format** lisible

### Dans les notifications

**Inclusion dans les emails :**
- **Types** déclarés
- **Catégories** concernées
- **Précisions** pour les autorités
- **Contexte** de l'événement

## 📋 Exemples de précisions

### Victimes - Autre

**Exemples de précisions :**
- "Discrimination en raison du handicap lors d'une sortie"
- "Isolement forcé d'un participant par le personnel"
- "Refus d'accès aux soins d'hygiène de base"
- "Humiliation publique d'un participant"

### Santé - Autre

**Exemples de précisions :**
- "Allergie non prise en compte dans les repas"
- "Médicament administré sans prescription"
- "Absence de suivi médical en cas d'urgence"
- "Refus de soins par le personnel"

### Sécurité - Autre

**Exemples de précisions :**
- "Porte de sortie de secours bloquée"
- "Éclairage défaillant dans les couloirs"
- "Absence de surveillance lors d'une baignade"
- "Transport en véhicule non conforme"

### Fonctionnement - Autre

**Exemples de précisions :**
- "Absence de protocole d'urgence"
- "Formation insuffisante du personnel"
- "Manque de matériel adapté"
- "Organisation défaillante des activités"

## 🔐 Droits d'accès

### Rôles requis

**Sélection des types :**
- `EIG_ECRITURE` : Création et modification
- `EIG_LECTURE` : Consultation uniquement

### Restrictions

**Validation automatique :**
- **Types actifs** uniquement
- **Catégories** autorisées
- **Précisions** obligatoires pour "Autre"

## 📱 Responsive design

### Adaptation mobile

**Comportement :**
- **Liste** empilée verticalement
- **Cases à cocher** adaptées au tactile
- **Champs de texte** optimisés
- **Validation** visible

**Optimisations :**
- **Boutons** de taille adaptée
- **Messages** d'erreur lisibles
- **Navigation** tactile fluide 