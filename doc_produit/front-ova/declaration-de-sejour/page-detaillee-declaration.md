# Page détaillée d'une déclaration

La page détaillée d'une déclaration permet à l'utilisateur de consulter, modifier et gérer une déclaration de séjour spécifique.

[Capture]

## Accès à la page

La page est accessible depuis :
- **Liste des déclarations** : Cliquer sur une ligne du tableau
- **URL directe** : `/demande-sejour/{declarationId}`
- **Messagerie** : Accès depuis la liste des messages

## Structure de la page

### En-tête de la déclaration

L'en-tête affiche les informations principales de la déclaration :

- **Titre** : "Déclaration : [Libellé]" ou "Déclaration de séjour"
- **Informations générales** :
  - Organisme
  - Dates (début / fin)
  - Saison
  - Statut avec badge coloré
- **Alerte établissement secondaire** : Si applicable

### Onglets de navigation

La page est organisée en plusieurs onglets :

#### 1. Formulaire

L'onglet principal contenant le formulaire de déclaration avec :

**Menu latéral** : Navigation entre les étapes du formulaire
- Informations générales
- Informations sur les vacanciers
- Informations sur le personnel
- Projet de séjour (masqué pour déclarations à 8 jours)
- Informations sur le transport (masqué pour déclarations à 8 jours)
- Informations sanitaires (masqué pour déclarations à 8 jours)
- Sélection des hébergements
- Synthèse

**Zone de contenu** : Affichage de l'étape sélectionnée avec :
- Formulaire de saisie/modification
- Boutons de navigation (Précédent/Suivant)
- Validation en temps réel
- Messages d'erreur

#### 2. Documents joints

Onglet dédié à la gestion des documents :

**Documents générés par l'application** :
- CERFA
- Accusé de réception
- Autres documents officiels

**Documents téléversés par l'organisateur** :
- Agrément
- Protocoles sanitaires
- Protocoles de transport
- Justificatifs d'hébergement
- Fichiers de messagerie

#### 3. Historique de la déclaration

Chronologie complète des événements :
- Création de la déclaration
- Modifications apportées
- Transmissions
- Actions d'instruction
- Changements de statut

#### 4. Messagerie

Interface de communication avec les services instructeurs :
- Messages reçus
- Messages envoyés
- Indicateur de messages non lus
- Possibilité d'envoyer des messages
- Pièces jointes

## Fonctionnalités par étape

### Informations générales

- **Titre du séjour** : Libellé de la déclaration
- **Dates** : Date de début et de fin (calcul automatique de la durée)
- **Responsable du séjour** : Informations complètes de la personne
- **Organisme** : Affichage des informations de l'organisme
- **Établissements secondaires** : Si applicable

### Informations sur les vacanciers

- **Nombre de vacanciers** : Répartition par tranches d'âge
- **Validation** : Contrôles automatiques des ratios
- **Modification en cours** : Possibilité de modifier même si validée

### Informations sur le personnel

- **Nombre d'accompagnants et responsables**
- **Procédure de recrutement supplémentaire**
- **Pour déclarations à 8 jours** :
  - Liste détaillée des accompagnants
  - Liste détaillée des encadrants
  - Formation et coordination
  - Prestataires (activités, entretien, médicaments, restauration, transport)

### Projet de séjour

- **Destinations** : Liste des destinations prévues
- **Activités** : Activités sportives, culturelles, bien-être
- **Description des activités** : Détail des activités du personnel

### Informations sur le transport

- **Responsable du transport** : Qui prend en charge le transport
- **Protocole de transport** : Détails du protocole
- **Documents joints** : Possibilité d'ajouter des documents

### Informations sanitaires

- **Dispositions sanitaires** : Protocole sanitaire
- **Documents joints** : Possibilité d'ajouter des documents

### Sélection des hébergements

- **Séjour itinérant** : Choix entre séjour fixe ou itinérant
- **Séjour à l'étranger** : Si séjour itinérant
- **Liste des hébergements** : Sélection et configuration
- **Dates par hébergement** : Configuration des dates de séjour
- **Informations de transport** : Spécifiques à chaque hébergement

### Synthèse

- **Récapitulatif complet** : Toutes les informations saisies
- **Validation des sections** : Indicateurs de complétude
- **Attestation sur l'honneur** : Signature électronique
- **Transmission** : Bouton de dépôt de la déclaration

## Permissions et modifications

### Conditions de modification

La déclaration peut être modifiée si :
- **Statut autorisé** : BROUILLON, A MODIFIER, ATTENTE_8_JOUR, A_MODIFIER_8J
- **Organisme propriétaire** : L'utilisateur appartient à l'organisme de la déclaration

### Modifications en cours

Certaines informations peuvent être modifiées même si la déclaration est validée :
- **Informations sur les vacanciers** : Nombre de vacanciers
- **Informations sur le personnel** : Personnel encadrant

## Navigation et workflow

### Navigation entre étapes

- **Menu latéral** : Clic direct sur une étape
- **Boutons Précédent/Suivant** : Navigation séquentielle
- **Validation automatique** : Passage à l'étape suivante si valide

### Workflow de transmission

1. **Saisie complète** : Toutes les étapes doivent être complètes
2. **Validation** : Contrôles automatiques de cohérence
3. **Attestation** : Signature de l'attestation sur l'honneur
4. **Transmission** : Dépôt de la déclaration
5. **Confirmation** : Accusé de réception automatique

## Messages et notifications

### Alertes contextuelles

- **Établissement secondaire** : Information si consultation d'une déclaration d'établissement secondaire
- **Validation** : Messages d'erreur de validation
- **Sauvegarde** : Confirmation de sauvegarde

### États de chargement

- **Indicateurs** : Affichage pendant les opérations
- **Messages** : Informations sur l'état des opérations
- **Désactivation** : Boutons désactivés pendant le traitement

## Responsive design

### Adaptation mobile

- **Menu latéral** : Adaptation pour petits écrans
- **Onglets** : Navigation adaptée
- **Formulaires** : Optimisation pour mobile

### Accessibilité

- **Navigation clavier** : Support complet
- **Lecteurs d'écran** : Compatibilité
- **Contraste** : Respect des standards d'accessibilité 