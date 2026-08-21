ARG NODE_VERSION=24.20.0-bookworm-slim
FROM node:${NODE_VERSION} AS builder

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && apt-get clean

WORKDIR /app

# pnpm via corepack (respect root packageManager)
RUN corepack enable

# Non-interactive pnpm behavior during Docker builds
ENV CI=true
ENV COREPACK_DEFAULT_TO_LATEST=0

# --- deps fetch layer (cache keyed by lockfile + config + packageManager)
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
RUN corepack prepare --activate
RUN pnpm fetch --prod --ignore-scripts

# --- install layer (package.json changes should not bust fetch cache)
COPY package.json ./
COPY packages/shared-bridge/package.json packages/shared-bridge/
COPY packages/shared-ui/package.json packages/shared-ui/
COPY packages/frontend-bo/package.json packages/frontend-bo/
RUN pnpm install --frozen-lockfile

# Application statique : `nuxt generate` lit ces valeurs pendant le build et les écrit
# dans les pages produites. Par défaut on y écrit des MARQUEURS `__NUXT_PUBLIC_X__`, que
# docker/runtime-env.sh remplace au démarrage du conteneur par les variables du
# déploiement : une seule image sert ainsi tous les environnements (build-once).
# Passer une vraie valeur en --build-arg (pipelines GitHub/Fabrique) reste possible :
# elle est alors figée dans l'image comme avant, et rien n'est remplacé au démarrage.
ARG NUXT_PUBLIC_APP_VERSION=development
ARG NUXT_PUBLIC_BACKEND_URL=__NUXT_PUBLIC_BACKEND_URL__
ARG NUXT_PUBLIC_ENVIRONMENT=__NUXT_PUBLIC_ENVIRONMENT__
ARG NUXT_PUBLIC_MATOMO_ENABLED=__NUXT_PUBLIC_MATOMO_ENABLED__
ARG NUXT_PUBLIC_MATOMO_HOST=__NUXT_PUBLIC_MATOMO_HOST__
ARG NUXT_PUBLIC_MATOMO_SITE_ID=__NUXT_PUBLIC_MATOMO_SITE_ID__
ARG NUXT_PUBLIC_SENTRY_DSN=__NUXT_PUBLIC_SENTRY_DSN__
ARG NUXT_PUBLIC_SENTRY_RELEASE
ARG NUXT_PUBLIC_SENTRY_ENABLED=__NUXT_PUBLIC_SENTRY_ENABLED__
ARG NUXT_PUBLIC_API_MAP_TILER=__NUXT_PUBLIC_API_MAP_TILER__
ARG SENTRY_ORG
ARG SENTRY_PROJECT
ARG SENTRY_URL

ENV NUXT_PUBLIC_APP_VERSION=$NUXT_PUBLIC_APP_VERSION
ENV NUXT_PUBLIC_BACKEND_URL=$NUXT_PUBLIC_BACKEND_URL
ENV NUXT_PUBLIC_ENVIRONMENT=$NUXT_PUBLIC_ENVIRONMENT
ENV NUXT_PUBLIC_MATOMO_ENABLED=$NUXT_PUBLIC_MATOMO_ENABLED
ENV NUXT_PUBLIC_MATOMO_HOST=$NUXT_PUBLIC_MATOMO_HOST
ENV NUXT_PUBLIC_MATOMO_SITE_ID=$NUXT_PUBLIC_MATOMO_SITE_ID
ENV NUXT_PUBLIC_SENTRY_DSN=$NUXT_PUBLIC_SENTRY_DSN
ENV NUXT_PUBLIC_SENTRY_RELEASE=$NUXT_PUBLIC_SENTRY_RELEASE
ENV NUXT_PUBLIC_SENTRY_ENABLED=$NUXT_PUBLIC_SENTRY_ENABLED
ENV NUXT_PUBLIC_API_MAP_TILER=$NUXT_PUBLIC_API_MAP_TILER
ENV SENTRY_RELEASE=$NUXT_PUBLIC_SENTRY_RELEASE
ENV SENTRY_ORG=$SENTRY_ORG
ENV SENTRY_PROJECT=$SENTRY_PROJECT
ENV SENTRY_URL=$SENTRY_URL

COPY packages/shared-bridge packages/shared-bridge
COPY packages/shared-ui packages/shared-ui
COPY packages/frontend-bo packages/frontend-bo

# secret sentry optionnel : sans token, sentryVitePlugin skip l'upload des sourcemaps
RUN --mount=type=secret,id=sentry_auth_token \
    { [ ! -f /run/secrets/sentry_auth_token ] || export SENTRY_AUTH_TOKEN=$(cat /run/secrets/sentry_auth_token); } \
    && pnpm --filter @vao/frontend-bo generate

FROM ghcr.io/socialgouv/docker/nginx4spa:8.2.4

COPY --from=builder --chown=101:101 /app/packages/frontend-bo/.output/public /usr/share/nginx/html
# Remplace les marqueurs __NUXT_PUBLIC_X__ par les variables du déploiement, puis lance
# nginx. Wrapper nécessaire : l'entrypoint de nginx4spa n'exécute pas /docker-entrypoint.d.
COPY --chmod=755 docker/runtime-env.sh /runtime-env.sh
ENTRYPOINT ["/runtime-env.sh"]
CMD ["nginx", "-g", "daemon off;"]
