---
icon: shield-check
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
  metadata:
    visible: true
---

# Sécurité

Cette page documente les fonctionnalités de sécurité mises en place dans le système VAO.

## Détection de contenu JavaScript

- **Analyse automatique** : Chaque fichier uploadé est analysé pour détecter la présence de code JavaScript
- **Messages spécifiques** : Des messages d'erreur clairs sont affichés en cas de détection
- **Prévention** : Les fichiers contenant du JavaScript sont rejetés pour des raisons de sécurité

### Messages d'erreur

Lorsqu'un fichier contenant du JavaScript est détecté, l'utilisateur reçoit un message explicatif :
- Explication du rejet pour des raisons de sécurité
- Suggestion d'alternatives (fichiers PDF, images, etc.)
- Instructions pour corriger le problème

## Révocation de tokens

Un système de révocation automatique des tokens existants a été mis en place en cas de connexion suspecte.

### Déclencheurs

La révocation des tokens peut être déclenchée par :
- Tentatives de connexion multiples depuis des adresses IP différentes
- Connexions simultanées suspectes
- Activité anormale détectée par le système

### Conséquences

Lorsqu'une révocation est effectuée :
- Toutes les sessions actives de l'utilisateur sont fermées
- L'utilisateur doit se reconnecter
- Une notification est envoyée à l'utilisateur

## Blocage temporaire des comptes

Un système de blocage temporaire a été mis en place pour sécuriser les comptes BO et Usager.

### Paramètres de sécurité

- **Nombre de tentatives** : 5 tentatives infructueuses maximum
- **Durée du blocage** : 15 minutes
- **Déblocage automatique** : Le compte se débloque automatiquement après 15 minutes

### Fonctionnement

Le système surveille les tentatives de connexion et bloque temporairement le compte après 5 échecs consécutifs. Le blocage se lève automatiquement après 15 minutes, permettant à l'utilisateur de réessayer.

Voir la section détaillée dans [la documentation de création de compte](../front-ova/creation-de-compte/scenario-1-lorganisme-nexiste-pas-sur-la-plateforme-vao.md#securite---blocage-temporaire-des-comptes).

## Limite de caractères pour les messages

Une limite de caractères a été mise en place pour les messages afin d'éviter les erreurs côté serveur.

### Application

- **Messages internes** : Limite appliquée aux messages entre agents et organisateurs
- **Commentaires** : Limite appliquée aux commentaires dans les déclarations
- **Validation** : Vérification côté client et serveur

### Avantages

- **Stabilité** : Évite les erreurs de serveur liées aux messages trop longs
- **Performance** : Améliore les performances du système
- **Expérience utilisateur** : Messages plus concis et lisibles 