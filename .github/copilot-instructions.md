# Instructions Copilot - VAO

## Regles generales TypeScript

- Appliquer ces principes a tous les fichiers `*.ts`.
- Privilegier la surete de typage et le clean code.
- Utiliser des types explicites quand c'est pertinent.
- Utiliser `interface` et `type` pour les structures complexes.
- Utiliser des generics pour les composants ou fonctions reutilisables.
- Eviter `any`; preferer `unknown` quand le type n'est pas connu.
- Favoriser les fonctions pures quand c'est possible.
- Preferer `map`, `filter`, `reduce` aux boucles imperatives quand c'est adapte.
- Gerer `null` et `undefined` avec `?.` et `??`.
- Utiliser la destructuration pour clarifier le code.
- Utiliser `readonly` pour les valeurs immuables.
- Utiliser des type guards pour affiner les types.
- Utiliser les utility types (`Partial`, `Pick`, `Omit`, etc.).
- Preferer les unions discriminees pour les cas metier complexes.
- Eviter les commentaires/JSDoc non necessaires.
- Ecrire les `if` avec accolades, sur plusieurs lignes:

```ts
if (condition) {
  return something;
}
```

## Regles tests unitaires (TU)

- Les tests unitaires sont placés dans le meme dossier que l'implementation.
- Les TU ne s'appliquent qu'aux fonctions pures.
- Les TU ne doivent pas acceder a la base de donnees.
- Les TU ne doivent pas appeler de services externes.
- Les tests sont ecrits en TypeScript (`.ts` avec `import`).
- Se referer a `docs/tests/INTEGRATIONS_TEST` pour les conventions de tests du projet.

## Regles tests d'integration (TI)

- Les tests d'integration sont dans `*-server/src/__tests__`.
- Ne pas mocker les services dans les tests d'integration.
- Ne pas mocker les requetes base de donnees dans les tests d'integration.
- Decouper les fichiers de tests par domaine (premier mot du chemin de route).
- Nommer les fichiers de tests avec une minuscule.
- Les tests sont ecrits en TypeScript (`.ts` avec `import`).
- Se referer a `docs/tests/INTEGRATIONS_TEST` pour le cadre de reference.

## Regles globales

- Cote front, decouper au maximum en sous-composants par section fonctionnelle.
- Suivre les pratiques clean code dans la mesure du possible.
- Ne jamais utiliser de double ternaire.
- Ne jamais proposer de lancer le serveur de developpement.
- Ne jamais proposer d'ajouter des fichiers a Git ni de faire un commit.
- un fichier ts doit avoir uniquement des import/export et pas de module.exports (pas de melange es6)
- Un fichier js doit avoir uniquement des require/module.exports pas de export/import
- Un fichier vue doit utiliser typescript (<script lang="ts")
- Pour les messages de commit, utilise le resumé le plus court possible au format Conventional Commits.
