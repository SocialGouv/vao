# Corrections de bugs - Version 1.23.0

## Corrections Back-Office

### Tri et affichage des listes

- **Correction** : Tri par défaut corrigé dans les listes
- **Correction** : Crash sur tri des utilisateurs OVA avec même organisationId
- **Impact** : Amélioration de la stabilité et de l'expérience utilisateur
- **Références** : Issues #1111, #1088

### Export CSV

- **Correction** : Format SIRET/SIREN amélioré dans les exports CSV des organismes
- **Impact** : Meilleure lisibilité des données d'export
- **Référence** : Issue #1112

## Corrections Front-Office

### Déclarations de séjour

- **Correction** : Liste vide des déclarations de séjour corrigée
- **Correction** : Ajout du statut "validée8k" pour l'annulation des DS
- **Impact** : Amélioration de la gestion des déclarations
- **Références** : Issues #976, #1118

### Libellés et affichage

- **Correction** : Libellé établissement déclarant SIRET amélioré
- **Impact** : Clarification des informations affichées
- **Référence** : Issue #1029

## Corrections EIG (Établissements d'Information Générale)

### Gestion des agréments

- **Correction** : Problème de région d'agrément null résolu
- **Impact** : Gestion correcte des informations d'agrément
- **Référence** : Issue #1051

### Gestion des fichiers

- **Correction** : Crash EIG avec fichier vide corrigé
- **Impact** : Stabilité améliorée lors de la gestion des fichiers
- **Référence** : Issue #1153

## Améliorations d'accessibilité (RGAA)

### Boutons et interactions

- **Correction** : Boutons de suppression de fichiers (RGAA)
- **Correction** : Boutons de suppression de représentants (RGAA)
- **Correction** : Boutons de suppression d'hébergements (RGAA)
- **Impact** : Meilleure accessibilité pour les utilisateurs de technologies d'assistance
- **Références** : Issues #1140, #1139, #1143

### Navigation et liens

- **Correction** : Liens imbriqués (RGAA)
- **Correction** : Liens consulter hébergement (RGAA)
- **Correction** : Listes multiselect (RGAA)
- **Impact** : Navigation améliorée au clavier et avec les lecteurs d'écran
- **Références** : Issues #1148, #1142

### Affichage des mots de passe

- **Correction** : Bouton afficher/masquer mot de passe (RGAA)
- **Impact** : Accessibilité améliorée pour la gestion des mots de passe
- **Référence** : Issue #1137

## Impact global

Ces corrections apportent :

- **Stabilité** : Réduction des crashes et erreurs système
- **Accessibilité** : Conformité RGAA renforcée
- **Expérience utilisateur** : Interface plus fluide et intuitive
- **Fiabilité** : Gestion des données plus robuste