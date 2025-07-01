# Règles métiers – Établissements principaux et secondaires

## Établissement principal (Siège social)
- Un seul par organisme (personne morale), identifié par le SIREN/SIRET du siège
- Porte l'identité légale de l'organisme
- Gère la fiche organisme et la gestion des établissements secondaires
- Peut activer/désactiver les établissements secondaires pour l'organisation de séjours
- Doit être titulaire d'un agrément VAO

## Établissements secondaires
- Récupérés automatiquement via l'API INSEE à partir du SIREN du siège
- Uniquement accessibles et gérés par le siège social
- Peuvent être activés/désactivés individuellement (seuls ceux en activité peuvent être activés)
- Ne peuvent pas modifier la fiche organisme principale
- Héritent du SIREN du siège, mais ont un SIRET propre

## Règles de gestion complémentaires
- Un établissement secondaire ne peut exister sans siège rattaché
- La gestion des droits et des utilisateurs reste centralisée au siège
- Les établissements secondaires sont affichés, filtrés et rafraîchis dynamiquement depuis l'API INSEE
- Seuls les établissements secondaires en activité peuvent être activés pour organiser des séjours 