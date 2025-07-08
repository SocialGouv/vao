---
icon: list
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

# Liste des EIG

## Vue d'ensemble

La page **Liste des EIG** permet aux organisateurs de consulter et gérer tous leurs événements indésirables graves déclarés sur la plateforme VAO.

### 🎯 Fonctionnalités

- **Consultation** de tous les EIG de l'organisme
- **Recherche et filtrage** avancé
- **Tri et pagination** des résultats
- **Suppression** des EIG en brouillon
- **Navigation** vers la création d'un nouvel EIG

## 📋 Interface utilisateur

### Barre de recherche et filtres

![Interface de recherche des EIG](.gitbook/assets/eig-liste-filtres.png)

**Filtres disponibles :**

| Filtre | Description | Type |
|--------|-------------|------|
| **Déclaration** | Code de la déclaration de séjour | Texte |
| **Séjour** | Libellé du séjour | Texte |
| **Type d'événement** | Catégorie et type d'EIG | Sélection multiple |
| **Statut** | État de l'EIG (Brouillon, Envoyé, Lu) | Sélection multiple |
| **Date de l'EIG** | Période de survenue de l'incident | Plage de dates |

### Tableau des résultats

![Tableau des EIG](.gitbook/assets/eig-liste-tableau.png)

**Colonnes affichées :**

| Colonne | Description | Tri |
|---------|-------------|-----|
| **Déclaration** | Code de la déclaration de séjour | ✅ |
| **Date de déclaration** | Date de création de l'EIG | ✅ |
| **Territoire** | Département de survenue | ✅ |
| **Séjour** | Libellé du séjour concerné | ✅ |
| **Dates (Début-fin)** | Période du séjour | ✅ |
| **Types d'événement** | Catégories et types d'incidents | ❌ |
| **Date de l'incident** | Date de survenue de l'EIG | ✅ |
| **Statut** | État actuel de l'EIG | ✅ |
| **Actions** | Boutons d'action (suppression) | ❌ |

### Actions disponibles

#### **Suppression d'un EIG**

![Suppression EIG](.gitbook/assets/eig-liste-suppression.png)

**Conditions :**
- EIG en statut `BROUILLON` uniquement
- Droits `EIG_ECRITURE` requis
- Confirmation obligatoire

**Processus :**
1. Clic sur l'icône de suppression
2. Modal de confirmation
3. Suppression définitive de l'EIG

#### **Création d'un nouvel EIG**

![Bouton création EIG](.gitbook/assets/eig-liste-creation.png)

**Bouton "Déclarer un EIG" :**
- Visible si droits `EIG_ECRITURE`
- Redirection vers le formulaire de création
- Vérification de l'éligibilité des séjours

## 🔍 Recherche et filtrage

### Recherche textuelle

**Champs de recherche :**
- **Déclaration** : Recherche par code de déclaration
- **Séjour** : Recherche par libellé du séjour

**Fonctionnalités :**
- Recherche en temps réel
- Correspondance partielle
- Insensible à la casse

### Filtres par type d'événement

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
- Autre, à préciser

#### **Santé**
- Épidémie
- Accident corporel (chute, etc…)
- Autre, à préciser

#### **Sécurité**
- Vols
- Fugue
- Actes de malveillance
- Intoxication alimentaire
- Départ de feu
- Incendie
- Inondation
- Autre, à préciser

#### **Fonctionnement organisme**
- Procédures judiciaires à l'encontre de personnels
- Défaillance de personnels
- Défaillances techniques
- Conflits ou menaces de conflits internes
- Autre, à préciser

### Filtres par statut

**Statuts disponibles :**
- **Tous les statuts** (par défaut)
- **BROUILLON** : EIG en cours de saisie
- **ENVOYE** : EIG transmis aux autorités
- **LU** : EIG lu par les autorités

### Filtre par date

**Plage de dates :**
- Sélection de la période de survenue de l'incident
- Format : DD/MM/YYYY
- Recherche sur la date de l'EIG (pas la date de déclaration)

## 📊 Pagination et tri

### Pagination

**Options disponibles :**
- **10 éléments** par page (par défaut)
- **25 éléments** par page
- **50 éléments** par page
- **100 éléments** par page

### Tri des colonnes

**Colonnes triables :**
- **Déclaration** : Ordre alphabétique
- **Date de déclaration** : Ordre chronologique
- **Territoire** : Ordre alphabétique
- **Séjour** : Ordre alphabétique
- **Dates (Début-fin)** : Ordre chronologique
- **Date de l'incident** : Ordre chronologique
- **Statut** : Ordre alphabétique

**Direction du tri :**
- **Ascendant** : A → Z, ancien → récent
- **Descendant** : Z → A, récent → ancien

## 🔗 Navigation

### Vers la consultation d'un EIG

**Clic sur une ligne :**
- Redirection vers la page de consultation
- URL : `/eig/{id}`
- Affichage du récapitulatif si EIG envoyé

### Vers la création d'un EIG

**Bouton "Déclarer un EIG" :**
- Redirection vers le formulaire de création
- URL : `/eig`
- Vérification des droits et éligibilité

## ⚠️ Messages d'erreur

### Erreurs de récupération

**Message :** "Une erreur est survenue lors de la récupération des eigs"

**Causes possibles :**
- Problème de connexion réseau
- Erreur serveur
- Session expirée

**Actions :**
- Vérifier la connexion internet
- Rafraîchir la page
- Se reconnecter si nécessaire

### Erreurs de suppression

**Message :** "Une erreur est survenue lors de la suppression de l'EIG"

**Causes possibles :**
- EIG déjà transmis
- Droits insuffisants
- Erreur serveur

**Actions :**
- Vérifier le statut de l'EIG
- Contacter l'administrateur si nécessaire

## 🔐 Droits d'accès

### Rôles requis

**Consultation :**
- `EIG_LECTURE` : Accès en lecture seule
- `EIG_ECRITURE` : Accès complet

**Actions :**
- **Suppression** : `EIG_ECRITURE` + statut `BROUILLON`
- **Création** : `EIG_ECRITURE`

### Restrictions

**Éligibilité des séjours :**
- Séjours en cours ou terminés depuis moins d'une semaine
- Statuts : `VALIDEE_8J`, `SEJOUR_EN_COURS`, `TERMINEE`

## 📱 Responsive design

### Adaptation mobile

**Comportement :**
- Filtres empilés verticalement
- Tableau avec défilement horizontal
- Boutons adaptés à la taille d'écran

**Optimisations :**
- Texte tronqué avec ellipsis
- Tooltips sur les éléments tronqués
- Navigation tactile optimisée 