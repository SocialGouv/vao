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

# Static app: these values are read by `nuxt generate` at build time.
# Defaults are __SENTINEL__ placeholders, substituted at container start by
# docker/runtime-env.sh (build-once: one image serves every environment).
# Passing real values via --build-arg (legacy pipelines) still bakes them as before.
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
# Substitute __NUXT_PUBLIC_X__ sentinels with container env values, then start nginx.
# (nginx4spa's own entrypoint does not run /docker-entrypoint.d, hence the wrapper.)
COPY --chmod=755 docker/runtime-env.sh /runtime-env.sh
ENTRYPOINT ["/runtime-env.sh"]
CMD ["nginx", "-g", "daemon off;"]
