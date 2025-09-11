# Désactivation de compte OVA

Depuis la version v1.22.0, les agents du Back Office peuvent désactiver les comptes des utilisateurs OVA (Organisateurs de Vacances et d'Accueil) :

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

### Gestion des permissions

* Seuls les agents avec le rôle "Autorisé à désactiver les comptes du BO" peuvent effectuer cette action
* La désactivation est tracée dans les logs du système
* Les agents peuvent voir l'historique des désactivations/réactivations
