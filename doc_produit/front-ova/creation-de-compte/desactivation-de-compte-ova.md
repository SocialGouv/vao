# Désactivation de compte OVA

Depuis la version v1.22.0, les agents du Back Office peuvent désactiver les comptes des utilisateurs OVA (Organisateurs de Vacances et d'Accueil). Depuis la version v1.24.0, de nouvelles fonctionnalités ont été ajoutées pour la gestion automatique des comptes inactifs.

### Fonctionnalité de désactivation

* **Qui peut désactiver** : Les agents du Back Office avec les permissions appropriées
* **Comptes concernés** : Tous les comptes utilisateurs OVA (personnes morales et physiques)
* **Effet** : Le compte désactivé ne peut plus se connecter à la plateforme

### Processus de désactivation

1. L'agent accède à la liste des comptes utilisateurs OVA
2. Il sélectionne le compte à désactiver
3. Il clique sur l'action "Désactiver le compte"
4. Une confirmation est demandée avant la désactivation
5. Le compte est immédiatement désactivé

### Conséquences de la désactivation

* **Connexion** : L'utilisateur ne peut plus se connecter à la plateforme
* **Données** : Les données existantes sont conservées
* **Réactivation** : Seul un agent du Back Office peut réactiver le compte
* **Notifications** : L'utilisateur reçoit un email de notification de désactivation

### Désactivation temporaire (v1.24.0)

Depuis la version v1.24.0, les comptes peuvent être désactivés temporairement. Dans ce cas :

* Le compte est désactivé mais peut être réactivé automatiquement
* Un message d'erreur spécifique est affiché lors de la tentative de connexion
* L'utilisateur est informé de la désactivation temporaire et des actions à entreprendre

### Gestion automatique des comptes inactifs (v1.24.0)

Le système gère automatiquement les comptes inactifs selon un processus automatisé :

#### Notification avant désactivation (2 mois)

* **Déclencheur** : Un email de notification est envoyé aux utilisateurs dont le compte n'a pas été utilisé depuis une période prolongée (2 mois avant la date de suppression prévue)
* **Objectif** : Informer l'utilisateur de l'inactivité de son compte et des actions à entreprendre
* **Contenu** : L'email informe l'utilisateur qu'il doit se connecter pour éviter la désactivation de son compte

#### Gestion avant suppression (v1.24.0)

* **Processus automatique** : Avant la suppression définitive d'un compte inactif, le système :
  * Vérifie si le compte peut être réactivé
  * Envoie des notifications de rappel
  * Permet la réactivation du compte si l'utilisateur se reconnecte

#### Suppression de compte inactif (v1.24.0)

* **Déclencheur** : Les comptes inactifs depuis une période prolongée sont automatiquement supprimés
* **Fréquence** : Le processus s'exécute automatiquement via un job CRON
* **Conditions** : Seuls les comptes répondant aux critères d'inactivité sont concernés
* **Notification** : L'utilisateur est informé avant la suppression définitive

### Gestion des permissions

* Seuls les agents avec le rôle "Autorisé à désactiver les comptes du BO" peuvent effectuer cette action
* La désactivation est tracée dans les logs du système
* Les agents peuvent voir l'historique des désactivations/réactivations
