# Notifications EIG pour porteur d'agrément

## Fonctionnalité

Depuis la version v1.22.0, le système envoie automatiquement des notifications par email au porteur d'agrément lors de la création d'un EIG.

## Fonctionnement

### Déclenchement
- **Moment** : Notification automatique lors du dépôt d'un EIG (passage au statut ENVOYE)
- **Fréquence** : Une notification par EIG déposé
- **Automatique** : Aucune action manuelle requise

### Destinataire
- **Cible** : Le porteur d'agrément de l'organisme concerné
- **Identification** : Basée sur les informations renseignées dans la fiche organisateur
- **Email** : Utilise l'adresse email du porteur d'agrément

### Contenu de la notification
La notification contient les informations suivantes :
- **Type d'événement** : Nature de l'EIG (accident, incident, etc.)
- **Séjour concerné** : Informations sur le séjour (nom, dates, lieu)
- **Organisme** : Nom et informations de l'organisme
- **Date de déclaration** : Date et heure du dépôt de l'EIG
- **Statut** : Statut actuel de l'EIG

## Conditions d'envoi

### Prérequis
- L'organisme doit avoir un porteur d'agrément renseigné dans sa fiche
- L'EIG doit être déposé (statut ENVOYE)
- L'email du porteur d'agrément doit être valide et fonctionnel

### Validation
- Vérification automatique de la validité de l'email
- Contrôle de l'existence du porteur d'agrément
- Validation du statut de l'EIG

## Gestion des notifications

### Envoi automatique
- **Système** : Les notifications sont envoyées automatiquement par le système
- **Délai** : Envoi immédiat après le dépôt de l'EIG
- **Fiabilité** : Système de retry en cas d'échec temporaire

### Gestion des erreurs
- **Échec d'envoi** : Le système gère automatiquement les tentatives de renvoi
- **Email invalide** : Logging de l'erreur sans blocage du processus
- **Porteur manquant** : Pas de notification envoyée, processus EIG continue

### Traçabilité
- **Logs** : Chaque tentative d'envoi est tracée dans les logs système
- **Statut** : Suivi du statut d'envoi (succès, échec, retry)
- **Historique** : Conservation de l'historique des notifications

## Impact utilisateur

### Pour l'organisme
- **Information** : Le porteur d'agrément est informé en temps réel des EIG
- **Réactivité** : Possibilité d'intervenir rapidement si nécessaire
- **Traçabilité** : Historique des notifications reçues

### Pour les agents
- **Transparence** : Les agents sont informés des notifications envoyées
- **Suivi** : Possibilité de vérifier l'état des notifications
- **Support** : Aide aux utilisateurs en cas de problème

## Configuration

### Paramètres système
- **Activation** : Fonctionnalité activée par défaut
- **Désactivation** : Possibilité de désactiver via configuration système
- **Personnalisation** : Templates d'email personnalisables

### Maintenance
- **Monitoring** : Surveillance des taux de succès d'envoi
- **Optimisation** : Amélioration continue des performances
- **Mise à jour** : Évolution des templates et du contenu
