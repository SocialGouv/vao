# Nouvelles fonctionnalités v1.22.0

## 📅 Version publiée le 09 septembre 2025

Cette page récapitule toutes les nouvelles fonctionnalités et améliorations apportées dans la version v1.22.0 de la plateforme VAO.

## 🔧 Corrections de bugs

### Correction d'un crash à la déconnexion
- **Problème résolu** : Crash du backend lors de la déconnexion des utilisateurs
- **Impact** : Amélioration de la stabilité de la plateforme
- **Commit** : 75db4dc

### Corrections diverses
- **Liste vide** : Correction de l'affichage des listes vides dans le front office
- **Statuts** : Amélioration de la gestion des statuts de déclarations
- **Performance** : Optimisations générales de performance

## 🆕 Nouvelles fonctionnalités

### 1. Désactivation de compte OVA
- **Fonctionnalité** : Les agents du Back Office peuvent désactiver les comptes des utilisateurs OVA
- **Documentation** : [Création de compte - Désactivation de compte OVA](../front-ova/creation-de-compte/README.md#désactivation-de-compte-ova)
- **Commit** : 3b1db72

### 2. Passage en textarea pour la formation (DS8J)
- **Amélioration** : Le champ "Formation" dans les déclarations à 8 jours est maintenant une textarea
- **Avantage** : Saisie plus confortable pour les descriptions longues
- **Documentation** : [Étape 3 - Informations sur le personnel](../front-ova/declaration-de-sejour/declaration-a-8-jours/etape-3-informations-sur-le-personnel.md)
- **Commit** : 516ec33

### 3. Notifications EIG pour porteur d'agrément
- **Fonctionnalité** : Notifications automatiques par email au porteur d'agrément lors de la création d'un EIG
- **Documentation** : [Notifications porteur d'agrément](../front-ova/eig/notifications-porteur-agrement.md)
- **Commit** : 4a3435e

### 4. Masquage des hébergements si organisation incomplète
- **Fonctionnalité** : Les hébergements sont masqués si la fiche organisateur n'est pas complète
- **Documentation** : [Liste des hébergements](../liste-des-hebergements/README.md#nouvelles-fonctionnalités-v1220)
- **Commit** : 4824f13

### 5. Validation par établissement secondaire
- **Fonctionnalité** : Les établissements secondaires peuvent valider et organiser des séjours de manière autonome
- **Documentation** : [Établissements secondaires](../front-ova/fiche-organisateur/creation-de-la-fiche-organisateur/etape-2-etablissements-secondaires/README.md#nouvelles-fonctionnalités-v1220)
- **Commit** : bb0a719

## 🎨 Améliorations du Back Office

### Filtres améliorés
- **Performance** : Filtres plus performants et réactifs
- **Gestion** : Meilleure gestion des filtres multiples
- **Sauvegarde** : Sauvegarde automatique des préférences de filtrage

### Export CSV des hébergements
- **Nouvelle fonctionnalité** : Export CSV pour les données d'hébergement
- **Format** : CSV optimisé pour l'analyse et le traitement des données
- **Documentation** : [Page de liste des déclarations](../back-agents/declaration-de-sejour/page-de-liste-des-declarations.md#nouvelles-fonctionnalités-v1220)

### Compteur de déclarations
- **Affichage** : Compteur du nombre total de déclarations
- **Mise à jour** : Mise à jour automatique lors de l'application des filtres
- **Vue d'ensemble** : Permet d'avoir une vue d'ensemble rapide du volume

## 🔧 Améliorations techniques

### Mise à jour des données INSEE
- **URIs** : Mise à jour des endpoints de l'API INSEE
- **Authentification** : Amélioration du système d'authentification
- **Performance** : Optimisation des appels API
- **Documentation** : [Récupération automatique des établissements secondaires](../front-ova/fiche-organisateur/creation-de-la-fiche-organisateur/etape-2-etablissements-secondaires/recuperation-automatique-des-etablissements-secondaires.md#mises-à-jour-v1220---api-insee)
- **Commit** : c01c79b

## ♿ Améliorations d'accessibilité

### Liens d'évitement
- **Fonctionnalité** : Liens d'évitement fonctionnels sur toutes les pages
- **Navigation** : Facilite la navigation pour les utilisateurs de lecteurs d'écran
- **Disponibilité** : Accessibles via la touche Tab

### Déclaration d'accessibilité
- **Mise à jour** : Actualisation du contenu de la déclaration d'accessibilité
- **Conformité** : Alignement avec les dernières exigences réglementaires
- **Documentation** : [Accessibilité](../misc/accessibilite.md)
- **Commit** : f45cf51

### Corrections techniques
- **Scripts** : Amélioration de la compatibilité des scripts
- **Navigation** : Optimisation de la navigation au clavier
- **Contraste** : Vérification et amélioration des contrastes

## 📊 Impact utilisateur

### Pour les utilisateurs OVA
- **Expérience** : Amélioration de l'expérience utilisateur avec les textareas
- **Sécurité** : Meilleure gestion des comptes avec la désactivation
- **Notifications** : Information en temps réel via les notifications EIG

### Pour les agents
- **Efficacité** : Amélioration des outils de gestion avec les nouveaux filtres
- **Données** : Meilleur accès aux données avec les exports CSV
- **Contrôle** : Possibilité de désactiver les comptes problématiques

### Pour l'accessibilité
- **Inclusion** : Amélioration de l'accessibilité pour tous les utilisateurs
- **Conformité** : Mise en conformité avec les standards d'accessibilité
- **Navigation** : Facilitation de la navigation au clavier

## 🔗 Liens utiles

- [Changelog complet](https://github.com/SocialGouv/vao/releases/tag/v1.22.0)
- [Documentation générale](../README.md)
- [Table des matières](../SUMMARY.md)
