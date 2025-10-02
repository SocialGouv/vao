# Changelog - Version 1.23.0

**Date de release :** 1er octobre 2025

## 🚀 Nouvelles fonctionnalités

### Back-Office
- **Format SIRET/SIREN sur CSV organisme** : Les exports CSV incluent maintenant le format SIRET/SIREN pour une meilleure lisibilité
- **Arrêt envoi mail utilisateur supprimé** : Les emails ne sont plus envoyés aux utilisateurs supprimés
- **Refonte page synthèse EIG** : Interface modernisée et améliorée
- **Refonte pages territoires** : Interface plus intuitive et moderne

### Front-Office
- **Nouveau statut "validée8k"** : Possibilité d'annuler les déclarations de séjour avec ce statut
- **Libellé établissement déclarant SIRET** : Amélioration de la clarté des informations affichées

### Notifications
- **Notification compte bloqué** : Les utilisateurs sont maintenant notifiés par email lors du blocage de leur compte

### Améliorations techniques
- **Tokens différents BO/FO** : Séparation des tokens d'authentification pour une meilleure sécurité
- **Personnalisation pagination PDF** : Amélioration de la présentation des documents PDF

## 🐛 Corrections de bugs

### Stabilité
- **Tri par défaut** : Correction des problèmes de tri dans les listes
- **Crash liste utilisateurs OVA** : Résolution du crash sur les utilisateurs avec même organisationId
- **Liste vide déclarations** : Correction de l'affichage des listes vides
- **Crash EIG fichier vide** : Résolution du crash lors de la gestion de fichiers vides

### Gestion des données
- **Région agrément null** : Correction du problème de région d'agrément null
- **Libellés** : Amélioration des libellés d'établissement déclarant

## ♿ Améliorations d'accessibilité (RGAA)

### Boutons et interactions
- **Boutons de suppression** : Amélioration de l'accessibilité pour les fichiers, représentants et hébergements
- **Bouton afficher mot de passe** : Amélioration de l'accessibilité du bouton d'affichage des mots de passe

### Navigation
- **Liens imbriqués** : Correction des problèmes de navigation
- **Liens consulter hébergement** : Amélioration de l'accessibilité
- **Listes multiselect** : Amélioration de l'accessibilité des listes de sélection

## 📊 Impact utilisateur

### Pour les utilisateurs OVA
- Interface plus claire et intuitive
- Meilleure gestion des déclarations de séjour
- Notifications améliorées

### Pour les agents
- Interface back-office modernisée
- Gestion des données plus stable
- Exports CSV améliorés

### Pour tous les utilisateurs
- Accessibilité renforcée
- Navigation plus fluide
- Expérience utilisateur améliorée

## 🔧 Améliorations techniques

- Sécurité renforcée avec la séparation des tokens
- Stabilité améliorée du système
- Conformité RGAA renforcée
- Gestion des données plus robuste

---

**Note :** Cette version apporte des améliorations significatives en termes d'accessibilité, de stabilité et d'expérience utilisateur. Toutes les fonctionnalités existantes restent compatibles.
