# Pseudonymisation

## Lancer en local

### Setup de VAO

Avant de lancer la partie pseudonymisation, il faut effectuer le setup de l'environnement de dev en local (cf README à la racine).

### Setup de la partie pseudonymisation

- copier le fichier `.anonymizer/.env.example` dans `.anonymizer/.env`
- éditer `.env` avec le mot de passe postgres utilisé dans le setup de VAO
- lancer `yarn` dans le dossier `.anonymizer`
- lancer `yarn build` ou `yarn dev`
- lancer `./.anonymizer/anonymize.sh` (à la première exécution le script le lien pour télécharger la bonne release de `greenmask`, à copier quelque part dans votre `PATH`.

## Outils utilisés

Le script d'anonymisation utilise [Greenmask](https://greenmask.io/).

Toute la config est stockée dans le dossier `.anonymizer`.

Dans la config d'anonymisation de greenmask, on utilise :

- les transformers de base pour les cas simples (notamment dans les colonnes qui ne contiennent pas de JSON, ou des colonnes JSON qui requièrent des opérations simples)
- des petits scripts en ts pour les opérations plus compliquées, stockées dans `.anonymizer/ts-transformers`.

## Traitements effectués

TODO
