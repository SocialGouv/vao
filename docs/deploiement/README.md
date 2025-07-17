# Déploiement d’une version ou hotfix

## Prérequis :

Le déploiement en preprod et prod se font manuellement via les github Actions :

On s’assure avant tout qu’il ne subsiste pas de résidus sur la branche preprod qui ne devraient pas exister.

Pour cela faire un PR de <code>preprod -> main</code> et vérifier que le comparing ne renvoie aucun résultat.

![prerequis PR](./1-prerequis-PR.png)
![prerequis comparing](./1-prerequis-comparing.png)

Le comparing changes ne doit renvoyer aucun résultat.
Si ce n’est pas le cas alors se rapprocher de la dernière personne qui a laissé des résidus non mergés sur Main. 

## Option A : Déploiement d'une Release

### Phase 1 : Preprod

Faire une PR de main -> preprod 

![PR main vers preprod](./2-phase1-pr-main-preprod.png)

Nommer la PR avec le numéro de version (prendre la dernière et faire +1 sur le 2eme digit)

![Nom de la PR](./2-phase1-pr-main-naming.png)

Merger la branche sur preprod

![Merge de la PR](./2-phase1-pr-merge.png)

Si le déploiement se fait correctement, l'action PreProd visible dans .

En cas de succès, la nouvelle Release sera visible sur le [github actions](https://github.com/SocialGouv/vao/actions).
![Merge réalisé de la PR](./2-phase1-pr-merge-ended.png)

## Option B : Cas du déploiement d’un hotfix

### B.1 : Fixer l'anomalie

#### Sur l’environnement de dev

Se positionner sur la branche preprod et la tirer.

![Env dev pull preprod](./3-phase1-hotfix-pull.png)

Créer sa branche à partir de preprod

![Env dev checkout nouvelle branche](./3-phase1-hotfix-checkout.png)

Ajouter, commiter et pousser son hotfix dans la branche fix/…

![Env dev push nouvelle branche](./3-phase1-hotfix-push.png)

#### B.2 : Merger le hotfix sur github

Créer sa PR depuis sa <code>branche -> preprod</code>
![Env dev push nouvelle branche](./3-phase1-hotfix-PR.png)

<div style="display: flex; align-items: center; gap: 10px;">
  <img src="./0-warning.png" alt="Warning" width="40" />
  <span>La PR doit se faire de la branch <code>fix/ -> preprod</code></span>
</div>

![Env dev comparing PR](./3-phase1-hotfix-comparing.png)

Merger la branche sur preprod

En cas de succès, le fix sera visible sur le [github actions](https://github.com/SocialGouv/vao/actions).![Github actions](./0-github-actions.png)

![Merge réalisé de la PR](./3-phase1-hotfix-merge-ended.png)
Une fois l’anomalie fixée et testé (après merge) déployer

## Environnement de Pré-production

La préprod est accessible via les URLS suivantes :

- [Backoffice Agent](https://bo-vao-preprod.ovh.fabrique.social.gouv.fr/)
- [Front usagers OVA](https://vao-preprod.ovh.fabrique.social.gouv.fr/)
- [Service de mails](https://maildev-vao-preprod.ovh.fabrique.social.gouv.fr/)
- [Service backend](https://api-vao-preprod.ovh.fabrique.social.gouv.fr/)

## Déploiement Production (Option B (hotfix) ou option A (déploiement d'une release))

### Etape 1 : Création, d'un tag

Dans le menu action et menu release : [github actions/release](https://github.com/SocialGouv/vao/actions/workflows/release.yml)
![Déploiement release](./4-deploiement-release.png)

Cliquer sur “Run workflow”

<div style="display: flex; align-items: center; gap: 10px;">
  <img src="./0-warning.png" alt="Warning" width="40" />
  <span>La workflow doit se faire de la preprod</span>
</div>

![Déploiement tag preprod](./4-deploiement-release-on-preprod.png)![Déploiement run workflow](./4-deploiement-release-preprod-run.png)

Le résultat du déploiement sera visible dans le bloc Release de l’action.[github actions/release](https://github.com/SocialGouv/vao/actions/workflows/release.yml)
![Déploiement tag preprod](./4-deploiement-release-result.png)

### Etape 2 : Déploiement en production

![Production](./0-github-actions-production.png)

Dans le sommaire de l'action, cliquer sur le bouton "Run workflow" du bloc [Production](https://github.com/SocialGouv/vao/actions/workflows/production.yaml).

Cliquer sur Run Workflow, et se positionner sur l’onglet Tag

![Run workflow production](./4-deploiement-run-workflow.png)

Sélectionner le Tag correspondant à la version (normalement le premier proposé)

![Run workflow production tag](./4-deploiement-run-workflow-tag.png)

Suivez votre mise en production dans le bloc [Production](https://github.com/SocialGouv/vao/actions/workflows/production.yaml).
![github actions/production](./4-deploiement-production-result.png)

### Etape 3 : Rapatrier les données de préprod

Cette action est à réaliser que l’on ai passé un hotfix ou une version complète en Production

![PR preprod vers main](./5-postprod-1.png)
![PR preprod vers main](./5-postprod-2.png)

## Autre déploiement

Pour déployer un autre environnement, comme une branche par exemple, il suffit de pousser la branche sur le repo, qui déploiera automatique toute la stack via l'action review-auto ou review.
Pour connaître les Urls utilisées, consulter le dernier bloc dans le Summary.
Un environnement est persisté une semaine par défaut et sera supprimé en même temps que la branche associées, sauf si celle-ci est préfixée par persist/.
