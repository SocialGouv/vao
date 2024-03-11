# Bonnes pratiques

- [x] Définir licenses
- [x] Intégrer linters 
- [] Intégrer renovate
- [x] Conventionner commit
- [x] Ajouter le cors pour le backend
- [x] Conventionner versionning

# Intégration Fabrique

- [] Lier à sentry
- [] Lier à dashlord

# Base de données
- [] Utiliser eslint-plugin-sql-pretty
- [] Ajouter modèle de données
- [] Performance : Intégrer pgHero

# Kubernetes
- [] Ajouter annotations Ingress pour la production
- [] Ajouter route /healthz sur services backend
- [x] Sceller les secrets

Pas besoin de /metrics

https://grafana-ovh.fabrique.social.gouv.fr/explore?panes=%7B%22zM9%22:%7B%22datasource%22:%22P8E80F9AEF21F6940%22,%22queries%22:%5B%7B%22refId%22:%22A%22,%22expr%22:%22%7Bcluster%3D%5C%22ovh-dev%5C%22,%20namespace%3D%5C%22vao-preprod%5C%22,%20pod%3D%5C%22frontend-usagers-5757fbcb95-6bdm5%5C%22%7D%22,%22queryType%22:%22range%22,%22datasource%22:%7B%22type%22:%22loki%22,%22uid%22:%22P8E80F9AEF21F6940%22%7D,%22editorMode%22:%22code%22%7D%5D,%22range%22:%7B%22from%22:%22now-6h%22,%22to%22:%22now%22%7D%7D%7D&schemaVersion=1&orgId=1
https://grafana-ovh.fabrique.social.gouv.fr/d/cc4389e2-4664-4d72-96e3-2b5f63b9c9d8/kubernetes-compute-resources-namespace-pods?orgId=1&var-datasource=P5DCFC7561CCDE821&var-cluster=ovh-dev&var-namespace=vao-preprod&from=1707868199924&to=1707992081664
