# Instruction des déclarations de séjour

L'instruction des déclarations de séjour est effectuée par les agents des DDETS (Directions Départementales de l'Emploi, du Travail et des Solidarités) via l'interface back office.

## Workflow d'instruction

### Statuts des déclarations

Les déclarations de séjour passent par différents statuts lors de leur instruction :

- **TRANSMISE** : Déclaration à 2 mois transmise par l'organisateur
- **TRANSMISE 8J** : Déclaration à 8 jours transmise par l'organisateur
- **EN COURS** : Déclaration à 2 mois en cours d'instruction
- **EN COURS 8J** : Déclaration à 8 jours en cours d'instruction
- **A MODIFIER** : Demande de compléments pour déclaration à 2 mois
- **A MODIFIER 8J** : Demande de compléments pour déclaration à 8 jours
- **EN ATTENTE DECLARATION 8 JOURS** : Déclaration à 2 mois validée, en attente de la déclaration à 8 jours
- **VALIDEE 8J** : Déclaration à 8 jours validée
- **SEJOUR EN COURS** : Séjour en cours de réalisation
- **TERMINEE** : Séjour terminé
- **REFUSEE** : Déclaration refusée
- **REFUSEE 8J** : Déclaration à 8 jours refusée
- **ANNULEE** : Déclaration annulée
- **ABANDONNEE** : Déclaration abandonnée

### Actions possibles par l'agent

#### 1. Prise en charge

**Endpoint** : `POST /admin/:declarationId/prise-en-charge`

L'agent peut prendre en charge une déclaration transmise pour commencer l'instruction.

**Conditions** :
- Déclaration en statut `TRANSMISE` ou `TRANSMISE 8J`
- L'agent doit être instructeur principal (département du premier hébergement)

**Résultat** :
- Passage en statut `EN COURS` ou `EN COURS 8J`
- Génération d'un accusé de réception automatique

#### 2. Demande de compléments

**Endpoint** : `POST /admin/:declarationId/demande-complements`

L'agent peut demander des compléments à l'organisateur.

**Conditions** :
- Déclaration en statut `EN COURS` ou `EN COURS 8J`
- L'agent doit être instructeur principal

**Paramètres** :
- `commentaire` : Commentaire détaillé des compléments demandés

**Résultat** :
- Passage en statut `A MODIFIER` ou `A MODIFIER 8J`
- Envoi automatique d'un email à l'organisateur avec les détails des compléments
- L'organisateur peut modifier sa déclaration et la retransmettre

#### 3. Enregistrement (validation)

**Endpoint** : `POST /admin/:declarationId/enregistrement-2-mois`

L'agent peut valider et enregistrer une déclaration.

**Conditions** :
- Déclaration en statut `EN COURS` ou `EN COURS 8J`
- L'agent doit être instructeur principal

**Résultat** :
- Pour déclaration à 2 mois : Passage en statut `EN ATTENTE DECLARATION 8 JOURS`
- Pour déclaration à 8 jours : Passage en statut `VALIDEE 8J`
- Génération automatique d'un accusé de réception
- Envoi automatique d'un email de validation à l'organisateur

## Interface de consultation

### Liste des déclarations

L'agent peut consulter la liste des déclarations avec les informations suivantes :

- **Numéro de déclaration** : Format DS-YY-DEPARTEMENT-NNNN
- **Statut** : Statut actuel de la déclaration
- **Organisme** : Informations sur l'organisateur
- **Dates** : Date de début et de fin du séjour
- **Département de suivi** : Département principal d'instruction
- **Messages** : État des échanges (NON LU, LU, REPONDU)
- **Date de création/modification**

### Filtres disponibles

- **Par statut** : Filtrer par statut de déclaration
- **Par département** : Filtrer par département d'instruction
- **Par date** : Filtrer par période
- **Par message** : Filtrer les déclarations avec des messages non lus

### Consultation détaillée

L'agent peut consulter le détail complet d'une déclaration :

- **Informations générales** : Libellé, dates, durée, responsable
- **Informations sur les vacanciers** : Nombre, tranches d'âge, etc.
- **Informations sur le personnel** : Accompagnants, encadrants, formation
- **Projet de séjour** : Activités, destinations, etc.
- **Informations sur le transport** : Protocole de transport
- **Informations sanitaires** : Protocole sanitaire
- **Hébergements** : Liste des hébergements sélectionnés
- **Attestation** : Attestation sur l'honneur signée
- **Historique** : Chronologie des événements et modifications

## Notifications et emails

### Emails automatiques

Le système envoie automatiquement des emails lors des actions d'instruction :

1. **Accusé de réception** : Lors de la prise en charge
2. **Demande de compléments** : Lors de la demande de compléments
3. **Validation** : Lors de l'enregistrement/validation
4. **Notifications** : Notifications aux autres départements concernés

### Destinataires

- **Organisateur** : Emails de suivi et notifications
- **DDETS principales** : Notifications pour instruction
- **DDETS secondaires** : Informations pour coordination

## Gestion des documents

### Génération automatique

Le système génère automatiquement des documents PDF :

- **Déclaration à 2 mois** : Document complet de la déclaration
- **Déclaration à 8 jours** : Document complémentaire
- **Accusés de réception** : Documents officiels de validation

### Stockage

Les documents générés sont stockés et accessibles via l'interface back office pour consultation et téléchargement.

## Permissions et sécurité

### Contrôle d'accès

- **Instructeur principal** : Agent du département principal d'instruction
- **Instructeurs secondaires** : Agents des autres départements concernés
- **Rôles** : Contrôle des permissions par rôle utilisateur

### Traçabilité

Toutes les actions d'instruction sont tracées avec :
- **Utilisateur** : Agent ayant effectué l'action
- **Date et heure** : Horodatage de l'action
- **Type d'action** : Description de l'action effectuée
- **Métadonnées** : Données associées à l'action

## Statistiques et reporting

### Tableau de bord

L'agent dispose d'un tableau de bord avec les statistiques suivantes :

- **En cours** : Nombre de déclarations en cours d'instruction
- **Transmises** : Nombre de déclarations transmises en attente
- **Validées** : Nombre de déclarations validées
- **Terminées** : Nombre de séjours terminés
- **Messages** : Nombre de messages non lus, lus, répondu

### Extractions

Possibilité d'extraire des données pour reporting :
- **Liste des déclarations** : Export des déclarations filtrées
- **Statistiques** : Export des statistiques par période
- **Hébergements** : Export des données d'hébergement 