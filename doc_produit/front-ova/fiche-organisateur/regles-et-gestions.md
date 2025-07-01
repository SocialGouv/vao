---
layout:
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

# Règles et gestions

## Gestion des documents

### Types de documents acceptés

* **Agrément** : PDF uniquement
* **Documents transport** : PDF, PNG, JPG
* **Taille maximale** : 5 Mo par document

### Actions disponibles

* **Ajout** : Sélectionner un fichier depuis l'ordinateur
* **Remplacement** : Sélectionner un nouveau fichier pour remplacer l'existant
* **Téléchargement** : Télécharger le document depuis la fiche
* **Suppression** : Supprimer le document (selon les droits)

### Messages d'erreur

* **Format incorrect** : "Le document doit être au format \[format requis]"
* **Taille excessive** : "Le fichier dépasse la taille maximale autorisée"
* **Erreur de téléchargement** : "Une erreur est survenue lors du dépôt du document"

***

## Notifications et messages

### Messages de succès

* **Sauvegarde** : "Fiche organisateur sauvegardée"
* **Création** : "Fiche organisateur créée"
* **Finalisation** : "Fiche organisateur finalisée"
* **Document déposé** : "\[Nombre] document(s) déposé(s)"

### Messages d'erreur

* **Validation** : Messages d'erreur spécifiques à chaque champ
* **Fichier** : Messages d'erreur pour les problèmes de fichiers
* **Système** : Messages d'erreur génériques en cas de problème technique

### Droits d'accès et restrictions

#### Droits de modification

* **Personne physique** : Peut modifier toutes les sections
* **Personne morale siège social** : Peut modifier toutes les sections
* **Personne morale établissement secondaire** :
  * Peut modifier les renseignements généraux
  * Les protocoles transport et sanitaire sont hérités du siège social

#### Restrictions

* **Agrément** : Seul le porteur d'agrément peut modifier les informations d'agrément
* **Documents** : Certains documents peuvent être en lecture seule selon les droits

***

## Intégration avec le système

### Liens avec les déclarations de séjour

* La fiche organisateur doit être complète pour déclarer des séjours
* Les informations de l'organisme sont automatiquement pré-remplies dans les déclarations
* Les protocoles transport et sanitaire sont réutilisés dans les déclarations

### Synchronisation des données

* Les modifications de la fiche organisateur sont immédiatement disponibles
* Les établissements secondaires sont automatiquement mis à jour
* Les droits d'accès sont vérifiés en temps réel

***

## Support et assistance

### Aide contextuelle

* **Textes d'aide** : Informations complémentaires sur certains champs
* **Messages d'erreur** : Explications détaillées des erreurs de validation
* **Tooltips** : Informations au survol de certains éléments
