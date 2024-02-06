# Propos

TODO


# Structure des fichiers

src
    index.js
    web/
        app.js
        routes/
        controllers/
        middlewares/
    services/
    utils/
    models/

pm2.*
docker*

# Structure appelante

index ->  app   -> routes       ->  controllers ->  services -> models / validate
                -> middlewares

# TODO

* validation des appels clients (rôles + contenus)
* logging
* gestion des erreurs
* ajouter les tests
* séparer les sources du reste ? (ts / docker ...)

Déterminer si nous avons besoin de créer des models, services (utilisation multiple de la même fonction / bout de code)
Le dossier utils (ou helpers) contient les fonctions pures (pas d'IO par exemple). un test fonctionne avec une entrée et une sortie, sans mock.
Le dossier services contient les fonctions non pures (appel rest vers france-connect, appels aux BDD)