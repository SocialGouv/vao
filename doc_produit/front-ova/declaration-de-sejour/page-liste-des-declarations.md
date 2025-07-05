# Page de liste des déclarations

La page de liste des déclarations permet à l'utilisateur de consulter et gérer l'ensemble de ses déclarations de séjour.



## Accès à la page

La page est accessible depuis :

* **Menu principal** : "Déclarations de séjour" (si l'organisme est complet)
* **URL directe** : `/demande-sejour/liste`

## Fonctionnalités principales

### Affichage des déclarations

La page affiche un tableau avec les informations suivantes pour chaque déclaration :

* **ID** : Identifiant unique de la déclaration
* **N° enregistrement** : Numéro fonctionnel (ex: DS-24-75-0001)
* **SIRET** : SIRET de l'organisme
* **Statut** : Statut actuel de la déclaration avec badge coloré
* **Département de suivi** : Département principal d'instruction
* **Saison** : Saison du séjour (hiver, printemps, été, automne)
* **Dates** : Date de début et de fin du séjour
* **Date de modification** : Dernière modification de la déclaration
* **Actions** : Boutons d'actions disponibles

### Filtres de recherche

L'utilisateur peut filtrer les déclarations selon plusieurs critères :

* **ID** : Filtrer par identifiant de déclaration
* **N° enregistrement** : Filtrer par numéro fonctionnel
* **SIRET** : Filtrer par SIRET de l'organisme
* **Statut** : Filtrer par statut de déclaration
* **Département de suivi** : Filtrer par département d'instruction
* **Saison** : Filtrer par saison du séjour

### Actions disponibles

#### Actions par déclaration

* **Consulter** : Cliquer sur une ligne pour accéder au détail
* **Dupliquer** : Créer une copie de la déclaration (si statut autorisé)
* **Supprimer/Annuler** : Supprimer un brouillon ou annuler une déclaration

#### Actions globales

* **Nouvelle déclaration** : Bouton "Déclarer un nouveau séjour"
* **Export CSV** : Télécharger la liste au format CSV

## Statuts des déclarations

Les déclarations peuvent avoir les statuts suivants :

* **BROUILLON** : Déclaration en cours de saisie
* **TRANSMISE** : Déclaration à 2 mois transmise
* **TRANSMISE 8J** : Déclaration à 8 jours transmise
* **EN COURS** : Déclaration à 2 mois en instruction
* **EN COURS 8J** : Déclaration à 8 jours en instruction
* **A MODIFIER** : Demande de compléments pour déclaration à 2 mois
* **A MODIFIER 8J** : Demande de compléments pour déclaration à 8 jours
* **EN ATTENTE DECLARATION 8 JOURS** : Déclaration à 2 mois validée
* **VALIDEE 8J** : Déclaration à 8 jours validée
* **SEJOUR EN COURS** : Séjour en cours de réalisation
* **TERMINEE** : Séjour terminé
* **REFUSEE** : Déclaration refusée
* **REFUSEE 8J** : Déclaration à 8 jours refusée
* **ANNULEE** : Déclaration annulée
* **ABANDONNEE** : Déclaration abandonnée

## Navigation

### Fil d'Ariane

* **Accueil** → **Liste des déclarations**

### Navigation vers le détail

En cliquant sur une ligne du tableau, l'utilisateur accède à la page détaillée de la déclaration avec :

* **URL** : `/demande-sejour/{declarationId}`
* **Onglet par défaut** : Formulaire de la déclaration

## Fonctionnalités avancées

### Tri et pagination

* **Tri** : Possibilité de trier par colonne
* **Pagination** : Navigation entre les pages de résultats
* **Tri par défaut** : Par date de modification (plus récent en premier)

### Recherche en temps réel

* **Filtres dynamiques** : Mise à jour automatique lors de la saisie
* **URL persistante** : Les filtres sont conservés dans l'URL
* **État de la recherche** : Sauvegarde de l'état de recherche

### Responsive design

* **Mobile** : Adaptation de l'interface pour les petits écrans
* **Tableau** : Défilement horizontal sur mobile
* **Filtres** : Adaptation des filtres selon la taille d'écran

## Messages et notifications

### Alertes contextuelles

* **Organisme incomplet** : Message si l'organisme n'est pas complètement renseigné
* **Aucune déclaration** : Message si aucune déclaration n'existe
* **Erreurs** : Messages d'erreur en cas de problème

### Confirmations d'actions

* **Suppression** : Modal de confirmation avant suppression
* **Duplication** : Modal de confirmation avant duplication
* **Annulation** : Modal de confirmation avant annulation

## Permissions et restrictions

### Accès conditionnel

* **Organisme complet** : La page n'est accessible que si l'organisme est complètement renseigné
* **Déclarations autorisées** : Seules les déclarations de l'organisme connecté sont visibles

### Actions conditionnelles

* **Duplication** : Disponible uniquement pour certains statuts
* **Suppression** : Disponible uniquement pour les brouillons
* **Annulation** : Disponible pour les déclarations non terminées
