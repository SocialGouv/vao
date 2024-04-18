# Déploiement

Le déploiement en preprod et prod se font manuellement via les github Actions :

![Menu actions](<./menu-actions.png>)

Il est possible de déployer n'importe quoi (commit, branche, tag) sur n'importe quel environnement mais par bonne pratique, nous ne déploierons que des tags / releases.

## Release 

Ainsi, nous allons déclencler l'Action de release sur la branche main : 

![Action release](<./action-release.png>)

![Lancement release](<./action-release-1-lancement.png>)

![Déroulement](<./action-release-2-rafraichissement.png>)

![Fin de la release](<./action-release-3-fin.png>)

En cas de succès, la nouvelle Release sera visible sur le [repo](https://github.com/SocialGouv/vao/releases).

## Déploiement Préprod

Une fois le tag créé, il suffit de lancer l'action PreProd : 

![Action PreProd](<./action-preprod.png>)

Choisissez le tag souhaité :

![Action PreProd - choix tag](<./action-preprod-1-choix.png>)

Lancez l'action :

![Action PreProd - lancement](<./action-preprod-2-lancement.png>)

Cliquer sur l'action apparue pour suivre le détail du déploiement : 

![Action PreProd - rafraichissement](<./action-preprod-3-rafraichissement.png>)

Une fois terminé, l'environnement sera mis à jour.
Le tag déployé est visible sur les clients au niveau des footers.

La préprod est accessible via les URLS suivantes : 
* [Service backend](https://api-vao-preprod.ovh.fabrique.social.gouv.fr/)
* [Service instructeur](https://bo-vao-preprod.ovh.fabrique.social.gouv.fr/)
* [Service organisme](https://vao-preprod.ovh.fabrique.social.gouv.fr/)
* [Intercepteur mails](https://maildev-vao-preprod.ovh.fabrique.social.gouv.fr/) le cas échéant
  
Les Urls des services ainsi que l'url menant à l'aggrégateur de logs Grafana peuvent être retrouvées dans la dernière partie de l'action.

![Action PreProd - sumamry](<./action-preprod-summary.png>)

## Déploiement Prod

Les actions sont identiques au déploiement de la preprod, à ceci près qu'il faut utiliser l'acvtion prod.

## Autre déploiement

Pour déployer un autre environnement, comme une branche par exemple, il suffit de pousser la branche sur le repo, qui déploiera automatique toute la stack via l'action review-auto ou review. 
Pour connaître les Urls utilisées, consulter le dernier bloc dans le Summary.
Un environnement est persisté une semaine par défaut et sera supprimé en même temps que la branche associées, sauf si celle-ci est préfixée par persist/.
