# Contexte produit VAO

VAO = Vacances Adaptées Organisées. SI de gestion administrative des dossiers pour les ministères sociaux.

## Utilisateurs

| Rôle                    | Accès                                      | Rôle métier                       |
| ----------------------- | ------------------------------------------ | --------------------------------- |
| OVA                     | https://vao.social.gouv.fr/connexion       | Organisateur de Vacances Adaptées |
| Agent (DREETS / DDEETS) | https://admin-vao.social.gouv.fr/connexion | Instruction des déclarations      |
| Administrateur          | https://admin-vao.social.gouv.fr/connexion | Droits agent + lecture élargie    |

### OVA

- Enregistrer leur organisme
- Déclarations de séjour à **2 mois** puis à **8 jours** avant le début
- Suivre l'avancement, échanger avec les agents, rédiger des EIG

### Agents

- Instruire les déclarations : valider / refuser / demander des infos
- Échanger avec les OVA

## Concepts clés

- **OVA** : organisateur, utilisateur principal du front
- **Agent** : agent de l'État, back-office
- **Fiche organisateur** : profil obligatoire OVA, création en 6 étapes
- **Agrément** : « Vacances adaptées organisées », obligatoire
- **Personne physique** : EI, EIRL, micro-entreprise
- **Personne morale** : association, SAS, SARL, etc.
- **Siège social** : personne morale avec établissements secondaires
- **Protocoles** : transport et sanitaire, obligatoires pour les OVA

## Documentation GitBook

Référence rédactionnelle : https://dnum-ministeres-sociaux.gitbook.io/vao-documentation/t1eK0jUdXMliu8S6UWUr/llms-full.txt  
Index des URLs : https://dnum-ministeres-sociaux.gitbook.io/vao-documentation/t1eK0jUdXMliu8S6UWUr/llms.txt

| Section          | Chemin repo                           |
| ---------------- | ------------------------------------- |
| Front OVA        | `doc_produit/front-ova/`              |
| Back agents      | `doc_produit/back-agents/`            |
| Hébergements     | `doc_produit/liste-des-hebergements/` |
| Misc             | `doc_produit/misc/`                   |
| Includes GitBook | `doc_produit/.gitbook/includes/`      |
| Assets           | `doc_produit/.gitbook/assets/`        |

Fiche organisateur (6 étapes) : `doc_produit/front-ova/fiche-organisateur/README.md`

## Règles rédaction produit

- Suivre la structure officielle (llms-full.txt)
- Pas de supposition sur droits / règles sans confirmation code ou doc
- Utiliser les noms de composants / fichiers / fonctions du repo
- Prévoir des emplacements `[CAPTURE]` pour les captures
- Ne pas référencer les issues GitHub (suivi JIRA)
- Réponses centrées produit, pas uniquement techniques
- Sections FRONT (OVA), Back (Agents), MISC
- Réutiliser les includes GitBook (formulaires, emails, notifications)

## Liens

- Repo : https://github.com/SocialGouv/vao
- API GitHub : https://api.github.com/repos/SocialGouv/vao
